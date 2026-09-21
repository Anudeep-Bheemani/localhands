"use client";

import { useState } from "react";
import { MapPin, AlertTriangle, Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

type Card = {
  id: string;
  description: string;
  tags: string[];
  budget: number | null;
  preferredTime: string;
  isUrgent: boolean;
  locationAddress: string;
  photoUrls: string[];
  distanceKm: number;
  alreadyInterested: boolean;
  matchesSkills: boolean;
};

export function CustomJobBoard({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return <p className="mt-6 text-sm text-ink-muted">No open custom jobs right now — check back soon.</p>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {cards.map((card, i) => (
        <Reveal key={card.id} delay={Math.min(i * 0.05, 0.3)}>
          <CustomJobCard card={card} />
        </Reveal>
      ))}
    </div>
  );
}

function CustomJobCard({ card }: { card: Card }) {
  const [interested, setInterested] = useState(card.alreadyInterested);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function expressInterest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/custom-jobs/${card.id}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        setInterested(true);
        setShowMessage(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink">{card.description}</p>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {card.isUrgent && (
            <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
              <AlertTriangle size={11} /> Urgent
            </span>
          )}
          {card.matchesSkills && (
            <span className="flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink-muted">
              <Sparkles size={11} className="text-accent" /> Matches your skills
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {card.tags.map((t) => (
          <span key={t} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] text-ink-muted">
            {t}
          </span>
        ))}
      </div>

      {card.photoUrls.length > 0 && (
        <div className="mt-3 flex gap-2">
          {card.photoUrls.slice(0, 3).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {card.distanceKm.toFixed(1)} km · {card.locationAddress}
        </span>
        <span>{card.preferredTime}</span>
        {card.budget != null && <span>Budget ₹{card.budget.toFixed(0)}</span>}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {interested ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
            <Check size={15} /> Interest sent
          </span>
        ) : showMessage ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Optional note to the customer…"
              className="input resize-none"
            />
            <button
              onClick={expressInterest}
              disabled={loading}
              className="self-start rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send interest"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMessage(true)}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink hover:border-ink"
          >
            Express interest
          </button>
        )}
      </div>
    </div>
  );
}
