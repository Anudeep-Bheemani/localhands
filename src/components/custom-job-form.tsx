"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Locate, X } from "lucide-react";
import { MultiPhotoUpload } from "@/components/image-upload";
import { VoiceRecorder } from "@/components/voice-recorder";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[220px] rounded-2xl border border-border bg-canvas" /> }
);

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;
const TIME_OPTIONS = ["As soon as possible", "Today", "This week", "Flexible"];

export function CustomJobForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [budget, setBudget] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
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
    if (!description.trim()) {
      setError("Describe what you need done");
      return;
    }
    if (!address.trim()) {
      setError("Enter a location");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/custom-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          tags,
          locationLat: lat,
          locationLng: lng,
          locationAddress: address,
          budget: budget ? Number(budget) : null,
          preferredTime,
          isUrgent,
          photoUrls: photos,
          voiceNoteUrl: voiceUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/customer/custom-jobs");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      <label className="block">
        <span className="text-sm font-medium text-ink-muted">What do you need done?</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="E.g. Move a cupboard from the first floor to the ground floor."
          className="input mt-1.5 resize-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink-muted">Tags (optional)</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-border p-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-xs text-ink">
              {t}
              <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag, press Enter"
            className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm focus:outline-none"
          />
        </div>
      </label>

      <div>
        <div className="flex items-center justify-between">
          <label className="flex-1">
            <span className="text-sm font-medium text-ink-muted">Location</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g. HSR Layout, Bengaluru"
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
        <div className="mt-3">
          <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Budget (optional)</span>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="₹"
            className="input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Preferred time</span>
          <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="input mt-1.5">
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="accent-accent" />
        <AlertTriangle size={14} className="text-accent" />
        This is urgent
      </label>

      <div className="flex flex-wrap items-start gap-6">
        <MultiPhotoUpload folder="custom-jobs" values={photos} onChange={setPhotos} label="Photos (optional)" />
        <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} label="Voice note (optional)" />
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post custom job"}
      </motion.button>
    </form>
  );
}
