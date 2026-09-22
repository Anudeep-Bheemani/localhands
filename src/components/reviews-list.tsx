"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

const DIMS = [
  { key: "quality", label: "Work quality" },
  { key: "punctuality", label: "Punctuality" },
  { key: "communication", label: "Communication" },
  { key: "pricingTransparency", label: "Pricing transparency" },
  { key: "professionalism", label: "Professionalism" },
] as const;

type ReviewItem = {
  id: string;
  quality: number;
  punctuality: number;
  communication: number;
  pricingTransparency: number;
  professionalism: number;
  comment: string;
  createdAt: string;
  customerName: string;
  serviceName: string;
  workerReply: string | null;
};

export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}

function ReviewCard({ review: r }: { review: ReviewItem }) {
  const [reply, setReply] = useState(r.workerReply);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const overall = (r.quality + r.punctuality + r.communication + r.pricingTransparency + r.professionalism) / 5;

  async function submitReply() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${r.id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text }),
      });
      if (res.ok) {
        setReply(text);
        setReplying(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_12px_35px_-24px_rgba(24,53,87,0.5)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-gradient-to-br from-surface to-canvas p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
            {r.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink">{r.customerName}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{r.serviceName}</p>
            <div className="mt-2 flex items-center gap-1" aria-label={`${overall.toFixed(1)} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className={`text-base leading-none ${index < Math.round(overall) ? "text-accent" : "text-border"}`} aria-hidden="true">★</span>
              ))}
              <span className="ml-1 text-xs font-bold text-ink">{overall.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="p-5 sm:p-6">
        {r.comment ? (
          <p className="text-[15px] leading-7 text-ink">&ldquo;{r.comment}&rdquo;</p>
        ) : (
          <p className="text-sm italic text-ink-muted">No written comment was left.</p>
        )}
        <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {DIMS.map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">{d.label}</span>
                <span className="font-bold text-ink">{r[d.key]}/5</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r[d.key] / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {reply ? (
        <div className="mt-5 rounded-2xl border border-accent/15 bg-accent-soft/50 px-4 py-3">
          <p className="text-[11px] font-medium text-ink-muted">Your response</p>
          <p className="mt-0.5 text-sm text-ink">{reply}</p>
        </div>
        ) : replying ? (
        <div className="mt-5 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Write a public reply…"
            className="input resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={submitReply}
              disabled={loading}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:bg-accent disabled:opacity-50"
            >
              {loading ? "Posting…" : "Post reply"}
            </button>
            <button
              onClick={() => setReplying(false)}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink-muted hover:border-ink"
            >
              Cancel
            </button>
          </div>
        </div>
        ) : (
        <button
          onClick={() => setReplying(true)}
          className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition hover:text-accent"
        >
          <MessageSquare size={13} /> Reply
        </button>
        )}
      </div>
    </div>
  );
}
