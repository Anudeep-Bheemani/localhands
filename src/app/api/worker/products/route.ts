import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.workerProduct.create({
    data: { workerId: user.id, name: parsed.data.name, price: parsed.data.price },
  });

  return NextResponse.json({ product });
}
