import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ workerId: z.string() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customJob = await prisma.customJob.findUnique({ where: { id }, include: { interests: true } });
  if (!customJob || customJob.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (customJob.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer open" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const chosenInterest = customJob.interests.find((i) => i.workerId === parsed.data.workerId);
  if (!chosenInterest) return NextResponse.json({ error: "Worker hasn't expressed interest" }, { status: 400 });

  const [job] = await prisma.$transaction([
    prisma.job.create({
      data: {
        customerId: user.id,
        workerId: parsed.data.workerId,
        customJobId: id,
        status: "BOOKED",
        isUrgent: customJob.isUrgent,
        problemDescription: customJob.description,
        problemVoiceNoteUrl: customJob.voiceNoteUrl,
        jobLat: customJob.locationLat,
        jobLng: customJob.locationLng,
        jobAddress: customJob.locationAddress,
        initialEstimate: customJob.budget ?? 0,
        statusHistory: { create: { status: "BOOKED", note: "Customer picked worker from custom job interest" } },
      },
    }),
    prisma.customJob.update({ where: { id }, data: { status: "BOOKED", claimedByWorkerId: parsed.data.workerId } }),
    prisma.customJobInterest.update({ where: { id: chosenInterest.id }, data: { status: "ACCEPTED" } }),
    prisma.customJobInterest.updateMany({
      where: { customJobId: id, id: { not: chosenInterest.id } },
      data: { status: "DECLINED" },
    }),
  ]);

  return NextResponse.json({ job });
}
