import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const TRAVEL_DURATION_SECONDS = 75;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await req.json().catch(() => ({ action: null, reason: "" }));

  const job = await prisma.job.findUnique({
    where: { id },
    include: { worker: { include: { user: true } }, customer: true },
  });
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
      await notify({
        userId: job.customerId,
        type: "booking_accepted",
        title: `${job.worker.user.name} accepted your booking`,
        link: `/customer/jobs/${id}`,
      });
      return NextResponse.json({ job: updated });
    }
    case "reject": {
      if (!isWorker || job.status !== "REQUESTED") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "REJECTED", statusHistory: { create: { status: "REJECTED", note: "Worker declined the request" } } },
      });
      await notify({
        userId: job.customerId,
        type: "booking_rejected",
        title: `${job.worker.user.name} declined your request`,
        link: `/customer/jobs/${id}`,
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
      await notify({
        userId: job.customerId,
        type: "worker_travelling",
        title: `${job.worker.user.name} is on the way`,
        link: `/customer/jobs/${id}`,
      });
      return NextResponse.json({ job: updated });
    }
    case "arrive": {
      if (!isWorker || job.status !== "TRAVELLING") return badTransition();
      const updated = await prisma.job.update({
        where: { id },
        data: { status: "ARRIVED", statusHistory: { create: { status: "ARRIVED", note: "Worker has arrived" } } },
      });
      await notify({
        userId: job.customerId,
        type: "worker_arrived",
        title: `${job.worker.user.name} has arrived`,
        link: `/customer/jobs/${id}`,
      });
      return NextResponse.json({ job: updated });
    }
    case "start_work": {
      if (!isWorker || job.status !== "ARRIVED") return badTransition();
      if (!job.scopeConfirmed) {
        return NextResponse.json(
          { error: "Propose the final scope and get customer approval before starting work" },
          { status: 409 }
        );
      }
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
      await notify({
        userId: job.customerId,
        type: "job_completed",
        title: `${job.worker.user.name} marked the job complete`,
        message: "Review the invoice and pay when ready.",
        link: `/customer/jobs/${id}`,
      });
      return NextResponse.json({ job: updated });
    }
    case "cancel": {
      const cancellableByCustomer = isCustomer && ["REQUESTED", "BOOKED"].includes(job.status);
      const cancellableByWorker = isWorker && ["REQUESTED", "BOOKED", "TRAVELLING", "ARRIVED"].includes(job.status);
      if (!cancellableByCustomer && !cancellableByWorker) return badTransition();

      const updated = await prisma.job.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledBy: isCustomer ? "CUSTOMER" : "WORKER",
          cancellationReason: typeof reason === "string" ? reason.slice(0, 500) : "",
          statusHistory: { create: { status: "CANCELLED", note: typeof reason === "string" ? reason.slice(0, 500) : "" } },
        },
      });
      await notify({
        userId: isCustomer ? job.workerId : job.customerId,
        type: "job_cancelled",
        title: `${isCustomer ? job.customer.name : job.worker.user.name} cancelled the job`,
        message: typeof reason === "string" ? reason.slice(0, 200) : "",
        link: isCustomer ? `/worker/jobs/${id}` : `/customer/jobs/${id}`,
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
