import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ status: z.enum(["APPROVED", "DECLINED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; reqId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, reqId } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.additionalWorkRequest.findUnique({ where: { id: reqId } });
  if (!existing || existing.jobId !== id || existing.status !== "PENDING") {
    return NextResponse.json({ error: "Not found or already resolved" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.additionalWorkRequest.update({
    where: { id: reqId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ request: updated });
}
