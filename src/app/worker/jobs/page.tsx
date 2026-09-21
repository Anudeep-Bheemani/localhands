import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function WorkerJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { workerId: user.id },
    include: { customer: true, service: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Jobs</h1>
      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No booking requests yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/worker/jobs/${job.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:border-ink"
            >
              <div>
                <p className="font-medium text-ink">{job.service?.name ?? "Custom job"}</p>
                <p className="text-sm text-ink-muted">{job.customer.name}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  job.status === "REQUESTED" ? "bg-accent-soft text-accent" : "bg-canvas text-ink-muted"
                }`}
              >
                {job.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
