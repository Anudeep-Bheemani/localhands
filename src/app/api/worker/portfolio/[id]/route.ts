import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.workerPortfolio.findUnique({ where: { id } });
  if (!existing || existing.workerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workerPortfolio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
