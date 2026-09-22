"use client";

import { useState } from "react";
import { Check, Loader2, Power } from "lucide-react";

export function WorkerAvailabilityToggle({ initialAvailable }: { initialAvailable: boolean }) {
  const [available, setAvailable] = useState(initialAvailable);
  const [saving, setSaving] = useState(false);

  async function toggleAvailability() {
    const nextValue = !available;
    setAvailable(nextValue);
    setSaving(true);

    try {
      const response = await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableNow: nextValue }),
      });

      if (!response.ok) setAvailable(!nextValue);
    } catch {
      setAvailable(!nextValue);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`mt-6 overflow-hidden rounded-3xl border p-5 transition-colors sm:p-6 ${
      available ? "border-accent/25 bg-accent-soft/60" : "border-border bg-surface"
    }`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            available ? "bg-accent text-white" : "bg-surface-subtle text-ink-muted"
          }`}>
            <Power size={19} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg tracking-tight text-ink">Your availability</h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                available ? "bg-accent/15 text-accent-dark" : "bg-surface-subtle text-ink-muted"
              }`}>
                {available ? "Live" : "Paused"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {available ? "Customers can find and request you right now." : "You are hidden from immediate availability searches."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAvailability}
          disabled={saving}
          aria-pressed={available}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
            available ? "bg-ink text-white hover:bg-ink/90" : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : available ? <Check size={16} /> : <Power size={16} />}
          {saving ? "Updating…" : available ? "Available now" : "Enable availability"}
        </button>
      </div>
    </section>
  );
}
