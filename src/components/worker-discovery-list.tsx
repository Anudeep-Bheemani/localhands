"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Star, MapPin, ShieldCheck, Check, X as XIcon } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import type { MatchReason } from "@/lib/matching";
import { Reveal } from "@/components/reveal";

export type WorkerCard = {
  id: string;
  name: string;
  profilePhotoUrl: string | null;
  bio: string;
  experienceYears: number;
  ratingAvg: number;
  jobsCompleted: number;
  availableNow: boolean;
  identityVerified: boolean;
  distanceKm: number;
  price: number;
  skills: string[];
  categoryNames: string[];
  reasons: MatchReason[];
  score: number;
  portfolioCount: number;
};

type Category = { id: string; name: string; slug: string; icon: string };

type SortKey = "best" | "nearest" | "rating" | "experience" | "price";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "best", label: "Best match" },
  { key: "nearest", label: "Nearest" },
  { key: "rating", label: "Highest rated" },
  { key: "experience", label: "Most experienced" },
  { key: "price", label: "Lowest price" },
];

export function WorkerDiscoveryList({
  cards,
  categories,
  matchedServiceName,
  matchedCategoryName,
  problem,
  searchParamsRaw,
}: {
  cards: WorkerCard[];
  categories: Category[];
  matchedServiceName: string | null;
  matchedCategoryName: string | null;
  problem: string;
  searchParamsRaw: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sort, setSort] = useState<SortKey>("best");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const maxPossibleDistance = Math.max(1, ...cards.map((c) => Math.ceil(c.distanceKm)));
  const [maxDistance, setMaxDistance] = useState(maxPossibleDistance);

  const filtered = useMemo(() => {
    let list = cards.filter((c) => c.ratingAvg >= minRating && c.distanceKm <= maxDistance);
    if (availableOnly) list = list.filter((c) => c.availableNow);

    const sorters: Record<SortKey, (a: WorkerCard, b: WorkerCard) => number> = {
      best: (a, b) => b.score - a.score,
      nearest: (a, b) => a.distanceKm - b.distanceKm,
      rating: (a, b) => b.ratingAvg - a.ratingAvg,
      experience: (a, b) => b.experienceYears - a.experienceYears,
      price: (a, b) => a.price - b.price,
    };
    return [...list].sort(sorters[sort]);
  }, [cards, sort, availableOnly, minRating, maxDistance]);

  function switchCategory(slug: string) {
    const params = new URLSearchParams(searchParamsRaw as Record<string, string>);
    params.delete("problem");
    params.delete("service");
    params.set("category", slug);
    router.push(`${pathname}?${params.toString()}`);
  }

  function browseAll() {
    const params = new URLSearchParams(searchParamsRaw as Record<string, string>);
    params.delete("problem");
    params.delete("service");
    params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {problem && <p className="text-sm text-ink-muted">&ldquo;{problem}&rdquo;</p>}
          <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">
            {matchedServiceName
              ? `${matchedCategoryName} → ${matchedServiceName}`
              : matchedCategoryName ?? "Top-rated workers near you"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{filtered.length} workers found</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={browseAll}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
            !matchedCategoryName ? "border-ink bg-ink text-canvas" : "border-border text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          Browse everyone nearby
        </button>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const active = cat.name === matchedCategoryName;
          return (
            <button
              key={cat.id}
              onClick={() => switchCategory(cat.slug)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
                active ? "border-ink bg-ink text-canvas" : "border-border text-ink-muted hover:border-ink hover:text-ink"
              }`}
            >
              <Icon size={13} />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                sort === opt.key ? "bg-ink text-canvas" : "text-ink-muted hover:bg-canvas"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-accent"
            />
            Available now
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink-muted">
            Min rating
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-1.5 py-1"
            >
              {[0, 3, 4, 4.5].map((r) => (
                <option key={r} value={r}>
                  {r === 0 ? "Any" : `${r}+`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink-muted">
            Within
            <input
              type="range"
              min={1}
              max={maxPossibleDistance}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-24 accent-accent"
            />
            <span className="w-12 text-ink">{maxDistance} km</span>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {filtered.map((worker, i) => (
          <Reveal key={worker.id} delay={Math.min(i * 0.05, 0.3)}>
            <WorkerCardItem worker={worker} searchParamsRaw={searchParamsRaw} />
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-muted">
            No workers match these filters yet.
          </p>
        )}
      </div>
    </div>
  );
}

function WorkerCardItem({
  worker,
  searchParamsRaw,
}: {
  worker: WorkerCard;
  searchParamsRaw: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams(searchParamsRaw as Record<string, string>);
  const href = `/customer/worker/${worker.id}?${params.toString()}`;
  const strongMatch = worker.reasons.filter((r) => r.met).length >= 4;

  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-display text-lg text-accent">
            {worker.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={worker.profilePhotoUrl} alt={worker.name} className="h-full w-full object-cover" />
            ) : (
              worker.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-ink">{worker.name}</p>
              {worker.identityVerified && <ShieldCheck size={14} className="text-accent" />}
            </div>
            <p className="text-xs text-ink-muted">{worker.skills.slice(0, 2).join(" · ") || worker.categoryNames[0]}</p>
          </div>
        </div>
        {strongMatch && (
          <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
            Strong match
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <Star size={13} className="text-accent" fill="currentColor" />
          {worker.ratingAvg > 0 ? worker.ratingAvg.toFixed(1) : "New"}
        </span>
        <span>{worker.jobsCompleted} jobs</span>
        <span>{worker.experienceYears} yrs exp</span>
        <span className="flex items-center gap-1">
          <MapPin size={13} />
          {worker.distanceKm.toFixed(1)} km
        </span>
        {worker.availableNow && <span className="text-accent">● Available now</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {worker.reasons.map((r) => (
          <span
            key={r.label}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
              r.met ? "bg-canvas text-ink-muted" : "bg-canvas text-ink-muted/50 line-through"
            }`}
          >
            {r.met ? <Check size={10} /> : <XIcon size={10} />}
            {r.label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-ink">
          From <span className="font-display text-lg">₹{worker.price === Infinity ? "—" : worker.price.toFixed(0)}</span>
        </p>
        <Link
          href={href}
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink hover:bg-canvas"
        >
          View profile
        </Link>
      </div>
    </motion.div>
  );
}
