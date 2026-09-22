import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReviewsList } from "@/components/reviews-list";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader eyebrow="⭐ Reputation" title="Reviews" description="Everything customers have said after a completed job." />

      {reviews.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-muted">
          No reviews yet — they&apos;ll show up here after your first completed job.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_2fr]">
            <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-[var(--shadow-elevated)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-white/55">Your reputation</p>
              <div className="relative mt-4 flex items-end gap-3">
                <span className="font-display text-6xl leading-none">
                  {(reviews.reduce((sum, review) => sum + DIMS.reduce((inner, d) => inner + review[d.key], 0) / DIMS.length, 0) / reviews.length).toFixed(1)}
                </span>
                <span className="pb-1 text-sm text-white/55">out of 5</span>
              </div>
              <div className="relative mt-4 flex items-center gap-1 text-2xl text-accent">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} aria-hidden="true">★</span>
                ))}
              </div>
              <p className="relative mt-3 text-sm text-white/65">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"} from completed jobs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {DIMS.map((d) => (
              <div key={d.key} className="flex flex-col justify-center rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
                <div className="text-lg leading-none text-accent" aria-hidden="true">★</div>
                <p className="mt-2 font-display text-2xl text-ink">{avgDim(d.key).toFixed(1)}</p>
                <p className="mt-1 text-[11px] font-medium leading-tight text-ink-muted">{d.label}</p>
              </div>
            ))}
            </div>
          </div>

          <ReviewsList
            reviews={reviews.map((r) => ({
              id: r.id,
              quality: r.quality,
              punctuality: r.punctuality,
              communication: r.communication,
              pricingTransparency: r.pricingTransparency,
              professionalism: r.professionalism,
              comment: r.comment,
              createdAt: r.createdAt.toISOString(),
              customerName: r.customer.name,
              serviceName: r.job.service?.name ?? "Custom job",
              workerReply: r.workerReply,
            }))}
          />
        </>
      )}
    </div>
  );
}
