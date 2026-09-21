import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      worker: { include: { user: true } },
      service: { include: { category: true } },
      jobProducts: { include: { workerProduct: true } },
      statusHistory: { orderBy: { timestamp: "asc" } },
      evidence: { orderBy: { createdAt: "asc" } },
      additionalWork: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.customerId !== user.id && job.workerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ job });
}
