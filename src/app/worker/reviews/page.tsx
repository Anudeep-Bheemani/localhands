import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DIMS = [
  { key: "quality", label: "Work quality" },
  { key: "punctuality", label: "Punctuality" },
  { key: "communication", label: "Communication" },
  { key: "pricingTransparency", label: "Pricing transparency" },
  { key: "professionalism", label: "Professionalism" },
] as const;

export default async function WorkerReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const reviews = await prisma.review.findMany({
    where: { workerId: user.id },
    include: { customer: { select: { name: true } }, job: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avgDim = (key: (typeof DIMS)[number]["key"]) =>
    reviews.length ? reviews.reduce((s, r) => s + r[key], 0) / reviews.length : 0;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Reviews</h1>
      <p className="mt-1 text-ink-muted">Everything customers have said after a completed job.</p>

      {reviews.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-muted">
          No reviews yet — they&apos;ll show up here after your first completed job.
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {DIMS.map((d) => (
              <div key={d.key} className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="font-display text-2xl text-ink">{avgDim(d.key).toFixed(1)}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">{d.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {reviews.map((r) => {
              const overall = (r.quality + r.punctuality + r.communication + r.pricingTransparency + r.professionalism) / 5;
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-accent">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-medium text-ink">{overall.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {r.customer.name} · {r.job.service?.name ?? "Custom job"}
                  </p>
                  {r.comment && <p className="mt-1.5 text-sm text-ink-muted">{r.comment}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-muted">
                    {DIMS.map((d) => (
                      <span key={d.key} className="rounded-full bg-canvas px-2 py-0.5">
                        {d.label}: {r[d.key]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
