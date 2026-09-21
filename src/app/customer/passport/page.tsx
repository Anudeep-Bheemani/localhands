import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategoryIcon } from "@/lib/category-icons";
import { Reveal } from "@/components/reveal";
import { Star, BookMarked } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default async function HomeServicePassportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/worker");

  const jobs = await prisma.job.findMany({
    where: { customerId: user.id, status: "COMPLETED" },
    include: {
      worker: { include: { user: { select: { name: true } } } },
      service: { include: { category: true } },
      customJob: true,
      jobProducts: { include: { workerProduct: true } },
      evidence: { orderBy: { createdAt: "asc" } },
      review: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">My Home</span>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">Home Service Passport</h1>
      <p className="mt-2 text-ink-muted">
        A running maintenance record of every completed job at your home — what was done, by whom, and when.
      </p>

      {jobs.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Nothing here yet"
          description="Completed jobs will show up here as your home's service history."
          actionLabel="Book your first job"
          actionHref="/customer"
        />
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {jobs.map((job, i) => {
            const Icon = job.service ? getCategoryIcon(job.service.category.icon) : getCategoryIcon("");
            const productsTotal = job.jobProducts.reduce((s, p) => s + p.qty * p.priceAtTime, 0);
            const total = job.confirmedTotal ?? job.initialEstimate;
            const title = job.service ? `${job.service.category.name} — ${job.service.name}` : "Custom job";
            const beforePhoto = job.evidence.find((e) => e.type === "BEFORE");
            const afterPhoto = job.evidence.find((e) => e.type === "AFTER");

            return (
              <Reveal key={job.id} delay={Math.min(i * 0.04, 0.3)}>
                <Link
                  href={`/customer/jobs/${job.id}`}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-ink sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{title}</p>
                      <p className="text-sm text-ink-muted">
                        {job.worker.user.name} · {new Date(job.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {job.review && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                          <Star size={11} className="text-accent" fill="currentColor" />
                          You rated this {(
                            (job.review.quality + job.review.punctuality + job.review.communication + job.review.pricingTransparency + job.review.professionalism) / 5
                          ).toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {(beforePhoto || afterPhoto) && (
                      <div className="flex -space-x-3">
                        {[beforePhoto, afterPhoto].filter(Boolean).map((e) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={e!.id}
                            src={e!.photoUrl}
                            alt={e!.type}
                            className="h-12 w-12 rounded-full border-2 border-surface object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="font-display text-lg text-ink">₹{total.toFixed(0)}</p>
                      <p className="text-xs text-ink-muted">
                        {productsTotal > 0 ? `incl. ₹${productsTotal.toFixed(0)} materials` : job.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
