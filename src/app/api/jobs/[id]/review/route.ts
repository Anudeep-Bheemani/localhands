import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  quality: z.coerce.number().int().min(1).max(5),
  punctuality: z.coerce.number().int().min(1).max(5),
  communication: z.coerce.number().int().min(1).max(5),
  pricingTransparency: z.coerce.number().int().min(1).max(5),
  professionalism: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).default(""),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { review: true, customer: true } });
  if (!job || job.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "COMPLETED") return NextResponse.json({ error: "Job isn't completed yet" }, { status: 409 });
  if (job.review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const review = await prisma.review.create({
    data: { jobId: id, customerId: user.id, workerId: job.workerId, ...parsed.data },
  });

  const agg = await prisma.review.aggregate({
    where: { workerId: job.workerId },
    _avg: { quality: true, punctuality: true, communication: true, pricingTransparency: true, professionalism: true },
  });
  const dims = [
    agg._avg.quality, agg._avg.punctuality, agg._avg.communication,
    agg._avg.pricingTransparency, agg._avg.professionalism,
  ].filter((v): v is number => v != null);
  const overallAvg = dims.reduce((s, v) => s + v, 0) / dims.length;

  await prisma.workerProfile.update({ where: { userId: job.workerId }, data: { ratingAvg: overallAvg } });

  const overall = (parsed.data.quality + parsed.data.punctuality + parsed.data.communication + parsed.data.pricingTransparency + parsed.data.professionalism) / 5;
  await notify({
    userId: job.workerId,
    type: "review_received",
    title: `${job.customer.name} left you a ${overall.toFixed(1)}★ review`,
    message: parsed.data.comment,
    link: `/worker/reviews`,
  });

  return NextResponse.json({ review });
}
