import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ photoUrl: z.string().url(), caption: z.string().max(140).default("") });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const item = await prisma.workerPortfolio.create({
    data: { workerId: user.id, photoUrl: parsed.data.photoUrl, caption: parsed.data.caption },
  });

  return NextResponse.json({ item });
}
