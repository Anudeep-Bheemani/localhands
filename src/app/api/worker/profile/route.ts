import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  availableNow: z.boolean().optional(),
  acceptsCustomJobs: z.boolean().optional(),
  bio: z.string().max(1000).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  profilePhotoUrl: z.string().url().nullable().optional(),
  baseAddress: z.string().min(1).max(200).optional(),
  baseLat: z.coerce.number().optional(),
  baseLng: z.coerce.number().optional(),
  serviceRadiusKm: z.coerce.number().min(1).max(50).optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const profile = await prisma.workerProfile.update({ where: { userId: user.id }, data: parsed.data });
  return NextResponse.json({ profile });
}
