import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

async function assertAccess(jobId: string, userId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return null;
  if (job.customerId !== userId && job.workerId !== userId) return null;
  return job;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await assertAccess(id, user.id);
  if (!job) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.chatMessage.findMany({
    where: { jobId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

const sendSchema = z.object({
  content: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  voiceNoteUrl: z.string().url().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await assertAccess(id, user.id);
  if (!job) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (!parsed.data.content && !parsed.data.imageUrl && !parsed.data.voiceNoteUrl) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: { jobId: id, senderId: user.id, ...parsed.data },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ message });
}
