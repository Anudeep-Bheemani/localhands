import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ workerId: z.string() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where: { customerId_workerId: { customerId: user.id, workerId: parsed.data.workerId } },
    update: {},
    create: { customerId: user.id, workerId: parsed.data.workerId },
  });

  return NextResponse.json({ favorite });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.favorite.deleteMany({ where: { customerId: user.id, workerId: parsed.data.workerId } });
  return NextResponse.json({ ok: true });
}
