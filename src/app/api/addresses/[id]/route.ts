import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.savedAddress.findUnique({ where: { id } });
  if (!existing || existing.customerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.savedAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
