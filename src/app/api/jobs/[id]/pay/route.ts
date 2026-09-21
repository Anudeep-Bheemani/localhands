import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({ method: z.enum(["UPI", "CARD", "CASH"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { additionalWork: true, customer: true } });
  if (!job || job.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "COMPLETED") return NextResponse.json({ error: "Job isn't completed yet" }, { status: 409 });
  if (job.paymentStatus === "PAID") return NextResponse.json({ error: "Already paid" }, { status: 409 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const approvedAdditions = job.additionalWork
    .filter((a) => a.status === "APPROVED")
    .reduce((s, a) => s + a.extraCost, 0);
  const finalTotal = (job.confirmedTotal ?? job.initialEstimate) + approvedAdditions;

  const [updatedJob] = await prisma.$transaction([
    prisma.job.update({
      where: { id },
      data: { paymentStatus: "PAID", paymentMethod: parsed.data.method, confirmedTotal: finalTotal },
    }),
    prisma.workerProfile.update({
      where: { userId: job.workerId },
      data: { totalEarned: { increment: finalTotal }, jobsCompleted: { increment: 1 } },
    }),
  ]);

  await notify({
    userId: job.workerId,
    type: "payment_received",
    title: `${job.customer.name} paid ₹${finalTotal.toFixed(0)}`,
    link: `/worker/jobs/${id}`,
  });

  return NextResponse.json({ job: updatedJob });
}
