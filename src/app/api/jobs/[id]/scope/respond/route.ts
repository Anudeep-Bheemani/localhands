import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({ approve: z.boolean() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { customer: true } });
  if (!job || job.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.proposedTotal == null) return NextResponse.json({ error: "No scope has been proposed yet" }, { status: 409 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.job.update({
    where: { id },
    data: parsed.data.approve
      ? {
          scopeConfirmed: true,
          confirmedTotal: job.proposedTotal,
          statusHistory: { create: { status: job.status, note: "Customer confirmed the scope" } },
        }
      : {
          proposedScope: null,
          proposedTotal: null,
          scopeConfirmed: false,
          statusHistory: { create: { status: job.status, note: "Customer requested a revised scope" } },
        },
  });

  await notify({
    userId: job.workerId,
    type: parsed.data.approve ? "scope_confirmed" : "scope_declined",
    title: parsed.data.approve ? `${job.customer.name} confirmed the scope` : `${job.customer.name} asked for a revised scope`,
    link: `/worker/jobs/${id}`,
  });

  return NextResponse.json({ job: updated });
}
