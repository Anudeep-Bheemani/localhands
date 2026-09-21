import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { services, portfolio, ...profile } = parsed.data;

  await prisma.$transaction([
    prisma.workerProfile.update({
      where: { userId: user.id },
      data: { ...profile, profileComplete: true },
    }),
    prisma.workerService.deleteMany({ where: { workerId: user.id } }),
    prisma.workerService.createMany({
      data: services.map((s) => ({ workerId: user.id, serviceId: s.serviceId, price: s.price })),
    }),
    prisma.workerPortfolio.deleteMany({ where: { workerId: user.id } }),
    ...(portfolio.length
      ? [
          prisma.workerPortfolio.createMany({
            data: portfolio.map((p) => ({ workerId: user.id, photoUrl: p.photoUrl, caption: p.caption })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
