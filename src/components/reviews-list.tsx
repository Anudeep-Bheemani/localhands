"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

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
    <div className="mt-6 flex flex-col gap-3">
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
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-accent">
          <Star size={14} fill="currentColor" />
          <span className="text-sm font-medium text-ink">{overall.toFixed(1)}</span>
        </div>
        <p className="text-xs text-ink-muted">
          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <p className="mt-1 text-sm font-medium text-ink">
        {r.customerName} · {r.serviceName}
      </p>
      {r.comment && <p className="mt-1.5 text-sm text-ink-muted">{r.comment}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-muted">
        {DIMS.map((d) => (
          <span key={d.key} className="rounded-full bg-canvas px-2 py-0.5">
            {d.label}: {r[d.key]}
          </span>
        ))}
      </div>

      {reply ? (
        <div className="mt-3 rounded-lg bg-canvas px-3 py-2">
          <p className="text-[11px] font-medium text-ink-muted">Your response</p>
          <p className="mt-0.5 text-sm text-ink">{reply}</p>
        </div>
      ) : replying ? (
        <div className="mt-3 flex flex-col gap-2">
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
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink"
        >
          <MessageSquare size={13} /> Reply
        </button>
      )}
    </div>
  );
}
