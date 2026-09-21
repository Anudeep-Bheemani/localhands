"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertTriangle } from "lucide-react";

type Request = {
  id: string;
  title: string;
  customerName: string;
  jobAddress: string;
  isUrgent: boolean;
  initialEstimate: number;
  createdAt: string;
};

export function IncomingRequestCard({ request }: { request: Request }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [resolved, setResolved] = useState(false);

  async function respond(action: "accept" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/jobs/${request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setResolved(true);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  if (resolved) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-warning/70 bg-surface p-5 shadow-[var(--shadow-elevated)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <span className="badge bg-warning-soft text-warning">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-warning" />
          New incoming job request
        </span>
        <span className="text-xs text-ink-muted">
          {new Date(request.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <div className="flex items-start gap-4">
            <span className="icon-chip h-14 w-14 shrink-0 font-display text-xl">{request.customerName.charAt(0)}</span>
            <div>
              <h3 className="text-lg font-bold text-ink sm:text-xl">{request.title}</h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Customer: <strong className="text-ink">{request.customerName}</strong>
              </p>
              {request.jobAddress && (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin size={13} className="shrink-0 text-accent" />
                  {request.jobAddress}
                </p>
              )}
              {request.isUrgent && (
                <span className="badge mt-2 bg-danger-soft text-danger">
                  <AlertTriangle size={10} /> Urgent
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface-subtle p-5 lg:col-span-4">
          <div>
            <span className="text-xs font-semibold uppercase text-ink-muted">Estimated payout</span>
            <p className="mt-1 text-2xl font-bold text-ink">₹{request.initialEstimate.toFixed(0)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => respond("reject")}
              disabled={!!loading}
              className="rounded-xl border border-border py-2.5 text-xs font-bold text-ink-muted hover:border-danger hover:text-danger disabled:opacity-50"
            >
              {loading === "reject" ? "…" : "Decline"}
            </button>
            <button
              onClick={() => respond("accept")}
              disabled={!!loading}
              className="rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-ink hover:brightness-110 disabled:opacity-50"
            >
              {loading === "accept" ? "…" : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
