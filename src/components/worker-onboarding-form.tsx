"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Locate } from "lucide-react";
import { SinglePhotoUpload, MultiPhotoUpload } from "@/components/image-upload";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[260px] rounded-2xl border border-border bg-canvas" /> }
);

type Service = { id: string; name: string; indicativePrice: number };
type Category = { id: string; name: string; icon: string; services: Service[] };

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export function WorkerOnboardingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [baseAddress, setBaseAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(5);
  const [acceptsCustomJobs, setAcceptsCustomJobs] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCount = useMemo(() => Object.keys(selected).length, [selected]);

  function toggleService(service: Service) {
    setSelected((prev) => {
      const next = { ...prev };
      if (service.id in next) {
        delete next[service.id];
      } else {
        next[service.id] = service.indicativePrice;
      }
      return next;
    });
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedCount === 0) {
      setError("Select at least one service you offer");
      return;
    }
    if (!baseAddress.trim()) {
      setError("Enter your service area / address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/worker/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          experienceYears,
          baseAddress,
          baseLat: lat,
          baseLng: lng,
          serviceRadiusKm,
          acceptsCustomJobs,
          profilePhotoUrl,
          services: Object.entries(selected).map(([serviceId, price]) => ({ serviceId, price })),
          portfolio: portfolio.map((photoUrl) => ({ photoUrl, caption: "" })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/worker");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-10">
      <Section title="Profile photo">
        <SinglePhotoUpload
          folder="profile-photos"
          value={profilePhotoUrl}
          onChange={setProfilePhotoUrl}
          label="This is what customers see first"
        />
      </Section>

      <Section title="About you">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="E.g. Residential electrician specialising in wiring and switchboard installation."
              className="input mt-1.5 resize-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Experience (yrs)</span>
            <input
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="input mt-1.5"
            />
          </label>
        </div>
      </Section>

      <Section title="Service area">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Address / area</span>
          <input
            value={baseAddress}
            onChange={(e) => setBaseAddress(e.target.value)}
            placeholder="E.g. Indiranagar, Bengaluru"
            className="input mt-1.5"
          />
        </label>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-ink-muted">Pin your base location</span>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            <Locate size={13} />
            Use my current location
          </button>
        </div>
        <div className="mt-2">
          <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">Click anywhere on the map to move the pin.</p>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-ink-muted">
            Service radius: <span className="text-ink">{serviceRadiusKm} km</span>
          </span>
          <input
            type="range"
            min={1}
            max={30}
            value={serviceRadiusKm}
            onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
      </Section>

      <Section title={`Skills & services (${selectedCount} selected)`}>
        <div className="flex flex-col gap-6">
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="text-sm font-medium text-ink">{cat.name}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {cat.services.map((service) => {
                  const isSelected = service.id in selected;
                  return (
                    <div
                      key={service.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                        isSelected ? "border-ink bg-canvas" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleService(service)}
                        className="flex flex-1 items-center gap-2.5 text-left text-sm text-ink"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? "border-accent bg-accent" : "border-border"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-canvas" />}
                        </span>
                        {service.name}
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-ink-muted">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={selected[service.id]}
                            onChange={(e) =>
                              setSelected((prev) => ({ ...prev, [service.id]: Number(e.target.value) }))
                            }
                            className="w-16 rounded-md border border-border bg-surface px-1.5 py-1 text-right"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Custom jobs">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={acceptsCustomJobs}
            onChange={(e) => setAcceptsCustomJobs(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm text-ink">
            I&apos;m open to one-off custom jobs outside my listed services
          </span>
        </label>
      </Section>

      <Section title="Portfolio (previous work)">
        <MultiPhotoUpload
          folder="portfolio"
          values={portfolio}
          onChange={setPortfolio}
          label="Show off your best work — optional but recommended"
        />
      </Section>

      {error && <p className="text-sm text-accent">{error}</p>}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas transition hover:bg-accent disabled:opacity-50"
      >
        {loading ? "Saving…" : "Complete profile"}
      </motion.button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
