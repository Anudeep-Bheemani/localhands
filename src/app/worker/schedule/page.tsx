import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScheduleView } from "@/components/schedule-view";

const ACTIVE_STATUSES = ["REQUESTED", "BOOKED", "TRAVELLING", "ARRIVED", "WORKING"] as const;

export default async function WorkerSchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const jobs = await prisma.job.findMany({
    where: { workerId: user.id, status: { in: [...ACTIVE_STATUSES] } },
    include: { customer: true, service: { include: { category: true } }, customJob: true },
    orderBy: [{ scheduledFor: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Schedule</h1>
      <p className="mt-1 text-ink-muted">Your accepted work, laid out by when it needs to happen.</p>

      <ScheduleView
        jobs={jobs.map((j) => ({
          id: j.id,
          status: j.status,
          isUrgent: j.isUrgent,
          scheduledFor: j.scheduledFor ? j.scheduledFor.toISOString() : null,
          customerName: j.customer.name,
          jobAddress: j.jobAddress,
          title: j.service ? `${j.service.category.name} — ${j.service.name}` : j.customJob ? "Custom job" : "Job",
        }))}
      />
    </div>
  );
}
