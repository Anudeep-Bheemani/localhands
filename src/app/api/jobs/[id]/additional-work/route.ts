import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(3).max(300),
  extraCost: z.coerce.number().min(0),
  reason: z.string().max(500).default(""),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { worker: { include: { user: true } } } });
  if (!job || job.workerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["ARRIVED", "WORKING"].includes(job.status)) {
    return NextResponse.json({ error: "Can only request additional work once on site" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const request_ = await prisma.additionalWorkRequest.create({
    data: { jobId: id, ...parsed.data },
  });

  await notify({
    userId: job.customerId,
    type: "additional_work_requested",
    title: `${job.worker.user.name} requested additional work approval`,
    message: `${parsed.data.description} — ₹${parsed.data.extraCost}`,
    link: `/customer/jobs/${id}`,
  });

  return NextResponse.json({ request: request_ });
}
