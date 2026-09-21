import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Briefcase, MapPin } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";

export default async function CustomerJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { customerId: user.id },
    include: { worker: { include: { user: true } }, service: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">My Jobs</h1>
      <p className="mt-1 text-ink-muted">Everything you&apos;ve booked, from request to review.</p>
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Describe a problem or browse a category to book your first worker."
          actionLabel="Find a worker"
          actionHref="/customer"
        />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/customer/jobs/${job.id}`} className="card flex items-center justify-between p-5 transition hover:border-accent">
              <div className="flex items-center gap-3.5">
                <span className="icon-chip h-11 w-11 shrink-0 font-display text-lg">{job.worker.user.name.charAt(0)}</span>
                <div>
                  <p className="text-sm font-bold text-ink">
                    {job.service ? `${job.service.category.name} — ${job.service.name}` : "Custom job"}
                  </p>
                  <p className="text-xs text-ink-muted">{job.worker.user.name}</p>
                  {job.jobAddress && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin size={11} className="text-accent" /> {job.jobAddress}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
