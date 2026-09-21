import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ message: z.string().max(500).default("") });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customJob = await prisma.customJob.findUnique({ where: { id } });
  if (!customJob || customJob.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer open" }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const interest = await prisma.customJobInterest.upsert({
    where: { customJobId_workerId: { customJobId: id, workerId: user.id } },
    update: { message: parsed.data.message },
    create: { customJobId: id, workerId: user.id, message: parsed.data.message },
  });

  return NextResponse.json({ interest });
}
