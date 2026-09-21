import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const bookingSchema = z.object({
  workerId: z.string(),
  serviceId: z.string().nullable(),
  customJobId: z.string().nullable().optional(),
  problemDescription: z.string().default(""),
  problemVoiceNoteUrl: z.string().url().nullable().optional(),
  problemPhotoUrl: z.string().url().nullable().optional(),
  jobLat: z.number().nullable().optional(),
  jobLng: z.number().nullable().optional(),
  jobAddress: z.string().default(""),
  isUrgent: z.boolean().default(false),
  products: z.array(z.object({ workerProductId: z.string(), qty: z.number().int().min(1) })).default([]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;

  const [service, products] = await Promise.all([
    data.serviceId ? prisma.service.findUnique({ where: { id: data.serviceId } }) : null,
    data.products.length
      ? prisma.workerProduct.findMany({ where: { id: { in: data.products.map((p) => p.workerProductId) } } })
      : [],
  ]);

  if (data.serviceId && !service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const productsTotal = data.products.reduce((sum, p) => {
    const product = products.find((wp) => wp.id === p.workerProductId);
    return sum + (product ? product.price * p.qty : 0);
  }, 0);
  const initialEstimate = (service?.indicativePrice ?? 0) + productsTotal;

  const job = await prisma.job.create({
    data: {
      customerId: user.id,
      workerId: data.workerId,
      serviceId: data.serviceId,
      customJobId: data.customJobId ?? null,
      status: "REQUESTED",
      isUrgent: data.isUrgent,
      problemDescription: data.problemDescription,
      problemVoiceNoteUrl: data.problemVoiceNoteUrl ?? null,
      jobLat: data.jobLat ?? null,
      jobLng: data.jobLng ?? null,
      jobAddress: data.jobAddress,
      initialEstimate,
      jobProducts: {
        create: data.products.map((p) => {
          const product = products.find((wp) => wp.id === p.workerProductId)!;
          return { workerProductId: p.workerProductId, qty: p.qty, priceAtTime: product.price };
        }),
      },
      statusHistory: { create: { status: "REQUESTED", note: "Booking request sent" } },
      ...(data.problemPhotoUrl
        ? { problemPhotos: { create: { customerId: user.id, photoUrl: data.problemPhotoUrl } } }
        : {}),
    },
  });

  return NextResponse.json({ job });
}
