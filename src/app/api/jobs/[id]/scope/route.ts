import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(3).max(500),
  total: z.coerce.number().min(0),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { worker: { include: { user: true } } } });
  if (!job || job.workerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "ARRIVED") {
    return NextResponse.json({ error: "Propose the scope once you've arrived and diagnosed the job" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const updated = await prisma.job.update({
    where: { id },
    data: {
      proposedScope: parsed.data.description,
      proposedTotal: parsed.data.total,
      scopeConfirmed: false,
      statusHistory: { create: { status: job.status, note: `Proposed scope: ${parsed.data.description} (₹${parsed.data.total})` } },
    },
  });

  await notify({
    userId: job.customerId,
    type: "scope_proposed",
    title: `${job.worker.user.name} proposed the final scope & price`,
    message: `₹${parsed.data.total} — approve before work starts`,
    link: `/customer/jobs/${id}`,
  });

  return NextResponse.json({ job: updated });
}
