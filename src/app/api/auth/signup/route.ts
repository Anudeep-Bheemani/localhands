import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

// Placeholder base location until a worker completes onboarding with a real one.
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, phone, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role,
      ...(role === "WORKER"
        ? {
            workerProfile: {
              create: {
                baseLat: DEFAULT_LAT,
                baseLng: DEFAULT_LNG,
              },
            },
          }
        : {}),
    },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
