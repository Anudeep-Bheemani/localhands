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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {DIMS.map((d) => (
              <div key={d.key} className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="font-display text-2xl text-ink">{avgDim(d.key).toFixed(1)}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">{d.label}</p>
              </div>
            ))}
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
