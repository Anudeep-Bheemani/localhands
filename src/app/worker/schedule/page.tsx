import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ACTIVE_STATUSES = ["BOOKED", "TRAVELLING", "ARRIVED", "WORKING"] as const;

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "New request",
  BOOKED: "Booked",
  TRAVELLING: "Travelling",
  ARRIVED: "Arrived",
  WORKING: "Working",
};

export default async function WorkerSchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const [active, pending] = await Promise.all([
    prisma.job.findMany({
      where: { workerId: user.id, status: { in: [...ACTIVE_STATUSES] } },
      include: { customer: true, service: { include: { category: true } } },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.job.findMany({
      where: { workerId: user.id, status: "REQUESTED" },
      include: { customer: true, service: { include: { category: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Schedule</h1>
      <p className="mt-1 text-ink-muted">Everything you&apos;ve accepted and still need to work through.</p>

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink">Awaiting your response ({pending.length})</h2>
          <div className="mt-3 flex flex-col gap-2">
            {pending.map((job) => (
              <ScheduleRow key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg text-ink">Active jobs ({active.length})</h2>
        {active.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing on your schedule right now.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {active.map((job) => (
              <ScheduleRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleRow({
  job,
}: {
  job: {
    id: string;
    status: string;
    isUrgent: boolean;
    jobAddress: string;
    customer: { name: string };
    service: { name: string; category: { name: string } } | null;
  };
}) {
  return (
    <Link
      href={`/worker/jobs/${job.id}`}
      className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:border-ink"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-ink">{job.service ? `${job.service.category.name} — ${job.service.name}` : "Custom job"}</p>
          {job.isUrgent && (
            <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              <AlertTriangle size={10} /> Urgent
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted">{job.customer.name}</p>
        {job.jobAddress && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <MapPin size={11} /> {job.jobAddress}
          </p>
        )}
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          job.status === "REQUESTED" ? "bg-accent-soft text-accent" : "bg-canvas text-ink-muted"
        }`}
      >
        {STATUS_LABEL[job.status] ?? job.status}
      </span>
    </Link>
  );
}
