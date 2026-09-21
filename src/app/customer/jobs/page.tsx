import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function CustomerJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { customerId: user.id },
    include: { worker: { include: { user: true } }, service: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">My Jobs</h1>
      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No jobs yet — describe a problem on the home page to get started.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/customer/jobs/${job.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:border-ink"
            >
              <div>
                <p className="font-medium text-ink">{job.service?.name ?? "Custom job"}</p>
                <p className="text-sm text-ink-muted">{job.worker.user.name}</p>
              </div>
              <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
                {job.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
