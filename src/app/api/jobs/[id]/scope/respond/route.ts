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
  const job = await prisma.job.findUnique({
    where: { id },
    include: { customer: true, worker: { include: { user: true } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role: "WORKER" | "CUSTOMER" | null =
    job.workerId === user.id ? "WORKER" : job.customerId === user.id ? "CUSTOMER" : null;
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (job.proposedTotal == null || !job.proposedBy) {
    return NextResponse.json({ error: "No price has been proposed yet" }, { status: 409 });
  }
  if (job.proposedBy === role) {
    return NextResponse.json({ error: "Waiting for the other side to respond to your proposal" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const responderName = role === "WORKER" ? job.worker.user.name : job.customer.name;
  const proposerId = job.proposedBy === "WORKER" ? job.workerId : job.customerId;

  const updated = await prisma.job.update({
    where: { id },
    data: parsed.data.approve
      ? {
          scopeConfirmed: true,
          confirmedTotal: job.proposedTotal,
          statusHistory: { create: { status: job.status, note: `${responderName} confirmed the price (₹${job.proposedTotal})` } },
        }
      : {
          proposedScope: null,
          proposedTotal: null,
          proposedBy: null,
          scopeConfirmed: false,
          statusHistory: { create: { status: job.status, note: `${responderName} declined the proposed price` } },
        },
  });

  await notify({
    userId: proposerId,
    type: parsed.data.approve ? "price_confirmed" : "price_declined",
    title: parsed.data.approve ? `${responderName} confirmed the price` : `${responderName} declined your proposed price`,
    link: `/${job.proposedBy === "WORKER" ? "worker" : "customer"}/jobs/${id}`,
  });

  return NextResponse.json({ job: updated });
}
