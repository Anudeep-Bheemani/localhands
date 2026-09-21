import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(5).max(1000),
  tags: z.array(z.string()).default([]),
  locationLat: z.number(),
  locationLng: z.number(),
  locationAddress: z.string().default(""),
  budget: z.coerce.number().min(0).nullable().optional(),
  preferredTime: z.string().default(""),
  isUrgent: z.boolean().default(false),
  photoUrls: z.array(z.string().url()).default([]),
  voiceNoteUrl: z.string().url().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const customJob = await prisma.customJob.create({
    data: { customerId: user.id, ...parsed.data, voiceNoteUrl: parsed.data.voiceNoteUrl ?? null },
  });

  return NextResponse.json({ customJob });
}
