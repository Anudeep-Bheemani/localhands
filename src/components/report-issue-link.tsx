"use client";

import { useState } from "react";
import { Flag, Check } from "lucide-react";

export function ReportIssueLink({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/issue-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, message }),
      });
      if (res.ok) {
        setSent(true);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Check size={12} className="text-accent" /> Thanks — we&apos;ve noted this.
      </p>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent">
        <Flag size={12} /> Report a problem
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="What went wrong?"
        className="input resize-none text-xs"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-canvas hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Sending…" : "Submit"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-border px-3 py-1 text-xs text-ink-muted hover:border-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}
