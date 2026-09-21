import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Plus, Star, Briefcase, ShieldCheck } from "lucide-react";
import { PickWorkerButton } from "@/components/pick-worker-button";

export default async function CustomerCustomJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const customJobs = await prisma.customJob.findMany({
    where: { customerId: user.id },
    include: {
      interests: {
        include: {
          worker: {
            include: {
              user: { select: { id: true, name: true } },
              services: { include: { service: { include: { category: true } } }, take: 3 },
            },
          },
        },
      },
      job: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-tight text-ink">My Custom Jobs</h1>
        <Link
          href="/customer/custom-jobs/new"
          className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent"
        >
          <Plus size={15} /> Post a custom job
        </Link>
      </div>

      {customJobs.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">You haven&apos;t posted any custom jobs yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {customJobs.map((cj) => (
            <div key={cj.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-ink">{cj.description}</p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    cj.status === "OPEN" ? "bg-accent-soft text-accent" : "bg-canvas text-ink-muted"
                  }`}
                >
                  {cj.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cj.tags.map((t) => (
                  <span key={t} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] text-ink-muted">
                    {t}
                  </span>
                ))}
              </div>

              {cj.status === "BOOKED" && cj.job && (
                <Link
                  href={`/customer/jobs/${cj.job.id}`}
                  className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
                >
                  View job workspace →
                </Link>
              )}

              {cj.status === "OPEN" && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                    Interested workers ({cj.interests.length})
                  </p>
                  {cj.interests.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-muted">No one has expressed interest yet.</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-3">
                      {cj.interests.map((interest) => (
                        <div key={interest.id} className="rounded-xl border border-border px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-ink">{interest.worker.user.name}</p>
                                {interest.worker.identityVerified && <ShieldCheck size={13} className="text-accent" />}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                                <span className="flex items-center gap-1">
                                  <Star size={11} className="text-accent" fill="currentColor" />
                                  {interest.worker.ratingAvg > 0 ? interest.worker.ratingAvg.toFixed(1) : "New"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase size={11} /> {interest.worker.jobsCompleted} jobs · {interest.worker.experienceYears} yrs
                                </span>
                              </div>
                              {interest.worker.services.length > 0 && (
                                <p className="mt-1 text-xs text-ink-muted">
                                  {[...new Set(interest.worker.services.map((s) => s.service.category.name))].join(" · ")}
                                </p>
                              )}
                              {interest.message && <p className="mt-1.5 text-sm text-ink">&ldquo;{interest.message}&rdquo;</p>}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <PickWorkerButton customJobId={cj.id} workerId={interest.worker.user.id} />
                              <Link
                                href={`/workers/${interest.worker.user.id}`}
                                target="_blank"
                                className="text-xs font-medium text-ink-muted hover:text-ink hover:underline"
                              >
                                View profile
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
