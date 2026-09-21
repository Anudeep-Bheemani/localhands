import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({ status: z.enum(["APPROVED", "DECLINED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; reqId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, reqId } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { customer: true } });
  if (!job || job.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.additionalWorkRequest.findUnique({ where: { id: reqId } });
  if (!existing || existing.jobId !== id || existing.status !== "PENDING") {
    return NextResponse.json({ error: "Not found or already resolved" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.additionalWorkRequest.update({
    where: { id: reqId },
    data: { status: parsed.data.status },
  });

  await notify({
    userId: job.workerId,
    type: parsed.data.status === "APPROVED" ? "additional_work_approved" : "additional_work_declined",
    title:
      parsed.data.status === "APPROVED"
        ? `${job.customer.name} approved your additional work request`
        : `${job.customer.name} declined your additional work request`,
    link: `/worker/jobs/${id}`,
  });

  return NextResponse.json({ request: updated });
}
