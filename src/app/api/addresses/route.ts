import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  label: z.string().min(1).max(40),
  address: z.string().min(3).max(200),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.savedAddress.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const address = await prisma.savedAddress.create({ data: { customerId: user.id, ...parsed.data } });
  return NextResponse.json({ address });
}
