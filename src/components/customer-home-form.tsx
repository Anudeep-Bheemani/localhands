"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Locate, Plus } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";
import { VoiceRecorder } from "@/components/voice-recorder";
import { getCategoryIcon } from "@/lib/category-icons";
import { Reveal } from "@/components/reveal";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[220px] rounded-2xl border border-border bg-canvas" /> }
);

type Category = { id: string; name: string; slug: string; icon: string };

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export function CustomerHomeForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [showMap, setShowMap] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
      setShowMap(true);
    });
  }

  function goToDiscover(params: Record<string, string>) {
    const search = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      address,
      ...(photoUrl ? { photoUrl } : {}),
      ...(voiceUrl ? { voiceUrl } : {}),
      ...params,
    });
    router.push(`/customer/discover?${search.toString()}`);
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      <Reveal>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!problem.trim()) return;
            goToDiscover({ problem });
          }}
          className="card rounded-[1.75rem] p-6 shadow-[var(--shadow-card)] transition-shadow focus-within:shadow-[var(--shadow-elevated)] sm:p-8"
        >
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
            placeholder="E.g. My electrical switchboard is damaged and I need it replaced."
            className="w-full resize-none border-0 bg-transparent font-display text-xl text-ink placeholder:text-ink-muted/60 focus:outline-none sm:text-2xl"
          />

          <div className="mt-5 flex flex-col gap-5 border-t border-border pt-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-5">
              <SinglePhotoUpload folder="problem-photos" value={photoUrl} onChange={setPhotoUrl} label="Photo" />
              <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} label="Voice note" />
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <label className="flex-1">
                <span className="text-sm font-medium text-ink-muted">Where do you need this?</span>
                <input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setShowMap(true);
                  }}
                  onFocus={() => setShowMap(true)}
                  placeholder="E.g. Koramangala, Bengaluru"
                  className="input mt-1.5"
                />
              </label>
              <button
                type="button"
                onClick={useMyLocation}
                className="ml-4 mt-6 flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                <Locate size={13} />
                Use current location
              </button>
            </div>
            {showMap && (
              <div className="mt-3">
                <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!problem.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas transition hover:bg-accent-dark disabled:opacity-40 sm:w-auto sm:px-8"
          >
            Find matching workers
            <ArrowRight size={16} />
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.08}>
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight text-ink">🔍 Or browse a category</h2>
            <Link
              href="/customer/custom-jobs/new"
              className="group flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:underline"
            >
              <Plus size={15} className="transition-transform group-hover:rotate-90" />
              Post a custom job
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToDiscover({ category: cat.slug })}
                  className="card group flex flex-col items-start gap-3 p-4 text-left transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="icon-chip h-10 w-10 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-accent group-hover:to-accent-dark group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-ink">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
