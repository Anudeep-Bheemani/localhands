import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ jobId: z.string().nullable().optional(), message: z.string().min(3).max(1000) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const report = await prisma.issueReport.create({
    data: { reporterId: user.id, jobId: parsed.data.jobId ?? null, message: parsed.data.message },
  });

  return NextResponse.json({ report });
}
