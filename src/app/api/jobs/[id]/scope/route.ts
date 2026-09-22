import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(3).max(500),
  total: z.coerce.number().min(0),
});

// Price/scope can be proposed by either side once the worker has accepted the
// booking, and any time before work is underway.
const NEGOTIABLE_STATUSES = ["BOOKED", "TRAVELLING", "ARRIVED"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { worker: { include: { user: true } }, customer: true },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role: "WORKER" | "CUSTOMER" | null =
    job.workerId === user.id ? "WORKER" : job.customerId === user.id ? "CUSTOMER" : null;
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!NEGOTIABLE_STATUSES.includes(job.status)) {
    return NextResponse.json(
      { error: "Price can only be proposed once the booking is accepted and before work starts" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const proposerName = role === "WORKER" ? job.worker.user.name : job.customer.name;

  const updated = await prisma.job.update({
    where: { id },
    data: {
      proposedScope: parsed.data.description,
      proposedTotal: parsed.data.total,
      proposedBy: role,
      scopeConfirmed: false,
      statusHistory: {
        create: { status: job.status, note: `${proposerName} proposed: ${parsed.data.description} (₹${parsed.data.total})` },
      },
    },
  });

  const recipientId = role === "WORKER" ? job.customerId : job.workerId;
  await notify({
    userId: recipientId,
    type: "price_proposed",
    title: `${proposerName} proposed a price — ₹${parsed.data.total}`,
    message: parsed.data.description,
    link: `/${role === "WORKER" ? "customer" : "worker"}/jobs/${id}`,
  });

  return NextResponse.json({ job: updated });
}
