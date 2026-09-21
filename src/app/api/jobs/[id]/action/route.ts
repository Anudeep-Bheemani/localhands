import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const TRAVEL_DURATION_SECONDS = 75;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json().catch(() => ({ action: null }));

  const job = await prisma.job.findUnique({ where: { id }, include: { worker: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const isWorker = job.workerId === user.id;
  const isCustomer = job.customerId === user.id;
  if (!isWorker && !isCustomer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  switch (action) {
    case "accept": {
      if (!isWorker || job.status !== "REQUESTED") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "BOOKED", statusHistory: { create: { status: "BOOKED", note: "Worker accepted the request" } } },
      });
      return NextResponse.json({ job: updated });
    }
    case "reject": {
      if (!isWorker || job.status !== "REQUESTED") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "REJECTED", statusHistory: { create: { status: "REJECTED", note: "Worker declined the request" } } },
      });
      return NextResponse.json({ job: updated });
    }
    case "start_travel": {
      if (!isWorker || job.status !== "BOOKED") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: {
          status: "TRAVELLING",
          travelStartLat: job.worker.baseLat,
          travelStartLng: job.worker.baseLng,
          travelEndLat: job.jobLat ?? job.worker.baseLat,
          travelEndLng: job.jobLng ?? job.worker.baseLng,
          travelStartedAt: new Date(),
          travelDurationSeconds: TRAVEL_DURATION_SECONDS,
          statusHistory: { create: { status: "TRAVELLING", note: "Worker is on the way" } },
        },
      });
      return NextResponse.json({ job: updated });
    }
    case "arrive": {
      if (!isWorker || job.status !== "TRAVELLING") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "ARRIVED", statusHistory: { create: { status: "ARRIVED", note: "Worker has arrived" } } },
      });
      return NextResponse.json({ job: updated });
    }
    case "start_work": {
      if (!isWorker || job.status !== "ARRIVED") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "WORKING", statusHistory: { create: { status: "WORKING", note: "Work started" } } },
      });
      return NextResponse.json({ job: updated });
    }
    case "complete": {
      if (!isWorker || job.status !== "WORKING") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: {
          status: "COMPLETED",
          confirmedTotal: job.confirmedTotal ?? job.initialEstimate,
          statusHistory: { create: { status: "COMPLETED", note: "Job marked complete" } },
        },
      });
      return NextResponse.json({ job: updated });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

function badTransition() {
  return NextResponse.json({ error: "That action isn't allowed right now" }, { status: 409 });
}
