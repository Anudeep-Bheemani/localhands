"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Star, MapPin, ShieldCheck, Check, X as XIcon, Heart } from "lucide-react";
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
  matchedCustomSkill?: string | null;
  portfolioCount: number;
  isFavorite: boolean;
};

type Category = { id: string; name: string; slug: string; icon: string };

const REAL_PROFILE_PHOTOS: Record<string, string> = {
  "Ramesh Kumar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&h=700&fit=crop&crop=faces",
  "Suresh Babu": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=700&fit=crop&crop=faces",
  "Vikram Singh": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=700&h=700&fit=crop&crop=faces",
  "Manoj Yadav": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&h=700&fit=crop&crop=faces",
  "Arjun Reddy": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&h=700&fit=crop&crop=faces",
  "Deepak Sharma": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=700&h=700&fit=crop&crop=faces",
  "Farida Khan": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=700&fit=crop&crop=faces",
  "Naveen Gowda": "https://images.unsplash.com/photo-1501196356602-3bb945089cbb?w=700&h=700&fit=crop&crop=faces",
  "Priya Nair": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&h=700&fit=crop&crop=faces",
  "Karthik Iyer": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=700&h=700&fit=crop&crop=faces",
  "Lakshmi Devi": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=700&h=700&fit=crop&crop=faces",
  "Geeta Menon": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=700&h=700&fit=crop&crop=faces",
  "Anitha Rao": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&h=700&fit=crop&crop=faces",
  "Shalini Verma": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700&h=700&fit=crop&crop=faces",
  "Mohammed Irfan": "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=700&h=700&fit=crop&crop=faces",
  "Ravi Teja": "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=700&h=700&fit=crop&crop=faces",
  "Ajay Kumar": "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=700&h=700&fit=crop&crop=faces",
  "Sandeep Patil": "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=700&h=700&fit=crop&crop=faces",
  "Divya Krishnan": "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=700&h=700&fit=crop&crop=faces",
  "Rahul Bose": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=700&h=700&fit=crop&crop=faces",
};

function workerPhoto(worker: WorkerCard) {
  if (worker.profilePhotoUrl && !worker.profilePhotoUrl.includes("api.dicebear.com")) return worker.profilePhotoUrl;
  return REAL_PROFILE_PHOTOS[worker.name] ?? null;
}

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
  hideHeader = false,
}: {
  cards: WorkerCard[];
  categories: Category[];
  matchedServiceName: string | null;
  matchedCategoryName: string | null;
  problem: string;
  searchParamsRaw: Record<string, string | undefined>;
  hideHeader?: boolean;
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
      {!hideHeader && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              {problem && <p className="mb-2 text-sm italic text-ink-muted">&ldquo;{problem}&rdquo;</p>}
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Find your local expert</p>
              <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                {matchedServiceName
                  ? `${matchedCategoryName} → ${matchedServiceName}`
                  : matchedCategoryName ?? "Top-rated workers near you"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">
                Browse trusted independent professionals, compare their work, and choose who feels right for your job.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-right shadow-sm">
              <p className="font-display text-2xl text-ink">{filtered.length}</p>
              <p className="text-xs text-ink-muted">workers nearby</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <button
              onClick={browseAll}
              className={`flex min-h-24 flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${
                !matchedCategoryName ? "border-ink bg-ink text-white shadow-lg" : "border-border bg-surface text-ink-muted hover:-translate-y-0.5 hover:border-ink hover:text-ink"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${!matchedCategoryName ? "bg-white/15 text-accent" : "bg-canvas text-ink"}`}>⌂</span>
              <span className="text-xs font-bold">Everyone</span>
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const active = cat.name === matchedCategoryName;
              const tone = categoryTone(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.slug)}
                  className={`group relative min-h-24 overflow-hidden rounded-2xl border p-3 text-left transition ${
                    active ? "border-ink bg-ink text-white shadow-lg" : "border-border bg-surface text-ink-muted hover:-translate-y-0.5 hover:border-ink hover:text-ink"
                  }`}
                >
                  <span className={`absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-30 ${tone}`} />
                  <span className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-white/15 text-accent" : "bg-canvas text-accent"}`}>
                    <Icon size={19} />
                  </span>
                  <span className={`relative mt-5 block text-xs font-bold ${active ? "text-white" : "text-ink"}`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Sort workers</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                sort === opt.key ? "bg-ink text-white" : "text-ink-muted hover:bg-canvas"
              }`}
            >
              {opt.label}
            </button>
          ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-xs font-medium text-ink-muted">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-accent"
            />
            Available now
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-xs font-medium text-ink-muted">
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
          <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-xs font-medium text-ink-muted">
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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((worker, i) => (
          <Reveal key={worker.id} delay={Math.min(i * 0.05, 0.3)}>
            <WorkerCardItem worker={worker} searchParamsRaw={searchParamsRaw} />
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-border p-14 text-center text-sm text-ink-muted">
            No workers match these filters yet.
          </p>
        )}
      </div>
    </div>
  );
}

function categoryTone(name: string) {
  const tones: Record<string, string> = {
    plumbing: "bg-sky-400",
    electrical: "bg-amber-400",
    cleaning: "bg-cyan-400",
    cooking: "bg-rose-400",
    "pet care": "bg-lime-400",
    "pet-care": "bg-lime-400",
    moving: "bg-violet-400",
    "moving & packing": "bg-violet-400",
    painting: "bg-pink-400",
    carpentry: "bg-orange-400",
    mechanic: "bg-slate-400",
    "ac & appliance repair": "bg-blue-400",
  };
  return tones[name.toLowerCase()] ?? "bg-accent";
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
  const [favorite, setFavorite] = useState(worker.isFavorite);
  const profilePhoto = workerPhoto(worker);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    const next = !favorite;
    setFavorite(next);
    await fetch("/api/favorites", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId: worker.id }),
    });
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_12px_35px_-26px_rgba(24,53,87,0.8)]">
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-ink via-[#183557] to-accent-dark">
        {profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profilePhoto} alt={`${worker.name}'s profile`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-ink via-[#183557] to-accent-dark">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/25 bg-white/15 font-display text-5xl text-white">
              {worker.name.charAt(0).toUpperCase()}
            </div>
            <span className="mt-3 text-xs font-medium text-white/65">Profile photo not added</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
        <button
          onClick={toggleFavorite}
          aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2.5 text-ink shadow-lg backdrop-blur transition hover:bg-white"
        >
          <Heart size={18} className={favorite ? "fill-accent text-accent" : ""} />
        </button>
        {strongMatch && (
          <span className="absolute bottom-4 left-4 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
            Strong match
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display text-2xl tracking-tight text-ink">{worker.name}</p>
              {worker.identityVerified && <ShieldCheck size={16} className="text-accent" />}
            </div>
            <p className="mt-1 text-sm text-ink-muted">{worker.skills.slice(0, 2).join(" · ") || worker.categoryNames[0]}</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-accent-soft px-2.5 py-1.5 text-sm font-bold text-accent-dark">
            <Star size={14} fill="currentColor" />
            {worker.ratingAvg > 0 ? worker.ratingAvg.toFixed(1) : "New"}
          </div>
        </div>

      {worker.matchedCustomSkill && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-dark px-2.5 py-1 text-[11px] font-semibold text-white">
          ✨ Matches &ldquo;{worker.matchedCustomSkill}&rdquo;
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
        <span className="font-semibold text-ink">{worker.jobsCompleted} jobs done</span>
        <span>{worker.experienceYears} yrs exp</span>
        <span className="flex items-center gap-1">
          <MapPin size={13} />
          {worker.distanceKm.toFixed(1)} km
        </span>
        {worker.availableNow && <span className="font-semibold text-accent">● Available now</span>}
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

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-ink">
          From <span className="font-display text-lg">₹{worker.price === Infinity ? "—" : worker.price.toFixed(0)}</span>
        </p>
        <Link
          href={href}
          className="rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent"
        >
          View profile
        </Link>
      </div>
      </div>
    </motion.div>
  );
}
