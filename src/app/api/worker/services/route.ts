import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ serviceId: z.string(), price: z.coerce.number().min(0) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const existing = await prisma.workerService.findUnique({
    where: { workerId_serviceId: { workerId: user.id, serviceId: parsed.data.serviceId } },
  });
  if (existing) return NextResponse.json({ error: "You already offer this service" }, { status: 409 });

  const service = await prisma.workerService.create({
    data: { workerId: user.id, serviceId: parsed.data.serviceId, price: parsed.data.price },
    include: { service: { include: { category: true } } },
  });

  return NextResponse.json({ service });
}
