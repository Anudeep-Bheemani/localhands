import Link from "next/link";
import { Star, ShieldCheck, MapPin, Briefcase, Calendar, Clock } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { WorkingHoursDay } from "@/components/worker-profile-manager";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function summarizeWorkingHours(hours: WorkingHoursDay[] | null): string | null {
  if (!hours) return null;
  const enabled = hours.filter((d) => d.enabled);
  if (enabled.length === 0) return null;

  const groups: { days: number[]; start: string; end: string }[] = [];
  for (const d of enabled) {
    const group = groups.find((g) => g.start === d.start && g.end === d.end);
    if (group) group.days.push(d.day);
    else groups.push({ days: [d.day], start: d.start, end: d.end });
  }

  return groups
    .map((g) => `${g.days.map((d) => DAY_ABBR[d]).join(", ")} · ${g.start}–${g.end}`)
    .join(" / ");
}

type WorkerData = {
  userId: string;
  bio: string;
  experienceYears: number;
  baseAddress: string;
  serviceRadiusKm: number;
  availableNow: boolean;
  acceptsCustomJobs: boolean;
  identityVerified: boolean;
  profilePhotoUrl: string | null;
  ratingAvg: number;
  jobsCompleted: number;
  createdAt: Date;
  workingHours: WorkingHoursDay[] | null;
  user: { name: string };
  services: { id: string; price: number; service: { name: string; category: { name: string } } }[];
  products: { id: string; name: string; price: number; inStock: boolean; stockQty: number; photoUrl: string | null }[];
  portfolio: { id: string; photoUrl: string; caption: string }[];
  reviewsReceived: {
    id: string;
    quality: number;
    punctuality: number;
    communication: number;
    pricingTransparency: number;
    professionalism: number;
    comment: string;
    createdAt: Date;
    workerReply: string | null;
  }[];
};

const DIMS = [
  { key: "quality", label: "Work quality" },
  { key: "punctuality", label: "Punctuality" },
  { key: "communication", label: "Communication" },
  { key: "pricingTransparency", label: "Pricing transparency" },
  { key: "professionalism", label: "Professionalism" },
] as const;

export function WorkerProfileView({
  worker,
  cta,
  passportMode = false,
}: {
  worker: WorkerData;
  cta: { label: string; href: string } | null;
  passportMode?: boolean;
}) {
  const reviewCount = worker.reviewsReceived.length;
  const avgDim = (key: (typeof DIMS)[number]["key"]) =>
    reviewCount ? worker.reviewsReceived.reduce((s, r) => s + r[key], 0) / reviewCount : 0;

  const memberSince = new Date(worker.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const workingHoursSummary = summarizeWorkingHours(worker.workingHours);

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          {passportMode && (
            <p className="mb-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-ink-muted">
              <Calendar size={12} /> Worker Passport · Member since {memberSince}
            </p>
          )}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-display text-2xl text-accent">
                {worker.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={worker.profilePhotoUrl} alt={worker.user.name} className="h-full w-full object-cover" />
                ) : (
                  worker.user.name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-2xl text-ink">{worker.user.name}</h1>
                  {worker.identityVerified && <ShieldCheck size={17} className="text-accent" />}
                </div>
                <p className="text-sm text-ink-muted">
                  {[...new Set(worker.services.map((s) => s.service.category.name))].join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-accent" fill="currentColor" />
                    {worker.ratingAvg > 0 ? worker.ratingAvg.toFixed(1) : "New"} ({reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} />
                    {worker.jobsCompleted} jobs completed
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {worker.baseAddress || "Service area"} · {worker.serviceRadiusKm} km radius
                  </span>
                  {workingHoursSummary && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {workingHoursSummary}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {cta && (
              <Link
                href={cta.href}
                className="rounded-full bg-accent px-7 py-3 text-center text-sm font-semibold text-accent-ink transition hover:brightness-110"
              >
                {cta.label}
              </Link>
            )}
          </div>

          {worker.bio && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-muted">{worker.bio}</p>}

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 ${worker.availableNow ? "bg-accent-soft text-accent" : "bg-canvas text-ink-muted"}`}>
              {worker.availableNow ? "Available now" : "Currently unavailable"}
            </span>
            <span className="rounded-full bg-canvas px-3 py-1 text-ink-muted">{worker.experienceYears} yrs experience</span>
            {worker.acceptsCustomJobs && (
              <span className="rounded-full bg-canvas px-3 py-1 text-ink-muted">Open to custom jobs</span>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink">Services & pricing</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {worker.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <span className="text-sm text-ink">{s.service.name}</span>
                <span className="text-sm font-medium text-ink">₹{s.price.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {worker.products.length > 0 && (
        <Reveal delay={0.1}>
          <section className="mt-8">
            <h2 className="font-display text-lg text-ink">Materials on hand</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {worker.products.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2.5 rounded-xl border border-border px-3 py-2 ${!p.inStock ? "opacity-50" : ""}`}
                >
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt={p.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-canvas" />
                  )}
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-medium ${p.inStock ? "text-ink" : "text-ink-muted line-through"}`}>{p.name}</p>
                    <p className="text-[11px] text-ink-muted">₹{p.price.toFixed(0)} {p.inStock ? `· ${p.stockQty} in stock` : "· out of stock"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {worker.portfolio.length > 0 && (
        <Reveal delay={0.14}>
          <section className="mt-8">
            <h2 className="font-display text-lg text-ink">Previous work</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {worker.portfolio.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={p.photoUrl} alt={p.caption} className="aspect-square rounded-xl object-cover" />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.18}>
        <section className="mt-8 pb-14">
          <h2 className="font-display text-lg text-ink">Reviews</h2>
          {reviewCount === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No reviews yet — be the first to book and review.</p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {DIMS.map((d) => (
                  <div key={d.key} className="rounded-xl border border-border bg-surface p-3 text-center">
                    <p className="font-display text-xl text-ink">{avgDim(d.key).toFixed(1)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{d.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {worker.reviewsReceived.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center gap-1 text-accent">
                      <Star size={13} fill="currentColor" />
                      <span className="text-sm font-medium text-ink">
                        {((r.quality + r.punctuality + r.communication + r.pricingTransparency + r.professionalism) / 5).toFixed(1)}
                      </span>
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-ink-muted">{r.comment}</p>}
                    {r.workerReply && (
                      <div className="mt-3 rounded-lg bg-canvas px-3 py-2">
                        <p className="text-[11px] font-medium text-ink-muted">Response from {worker.user.name.split(" ")[0]}</p>
                        <p className="mt-0.5 text-sm text-ink">{r.workerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </Reveal>
    </div>
  );
}
