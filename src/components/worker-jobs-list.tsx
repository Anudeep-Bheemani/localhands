"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, AlertTriangle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

type Job = {
  id: string;
  status: string;
  isUrgent: boolean;
  createdAt: string;
  scheduledFor: string | null;
  initialEstimate: number;
  confirmedTotal: number | null;
  customerName: string;
  customerPhone: string;
  jobAddress: string;
  title: string;
};

const PIPELINE = [
  { key: "all", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "active", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Declined" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

const ACTIVE_STATUSES = ["BOOKED", "TRAVELLING", "ARRIVED", "WORKING"];

export function WorkerJobsList({ jobs: initialJobs }: { jobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) {
      c[j.status] = (c[j.status] ?? 0) + 1;
      if (ACTIVE_STATUSES.includes(j.status)) c.active = (c.active ?? 0) + 1;
    }
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    if (filter === "all") return jobs;
    if (filter === "active") return jobs.filter((j) => ACTIVE_STATUSES.includes(j.status));
    return jobs.filter((j) => j.status === filter);
  }, [jobs, filter]);

  async function respond(id: string, action: "accept" | "reject") {
    const res = await fetch(`/api/jobs/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: data.job.status } : j)));
      router.refresh();
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {PIPELINE.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === p.key
                ? "bg-accent text-accent-ink shadow-sm"
                : "border border-border bg-surface text-ink-muted hover:border-accent"
            }`}
          >
            {p.label}
            {counts[p.key] ? <span className="ml-1.5 opacity-75">{counts[p.key]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-muted">
            Nothing in this category yet.
          </p>
        ) : (
          filtered.map((job) => {
            const isPending = job.status === "REQUESTED";
            return (
              <div
                key={job.id}
                className={`card p-5 sm:p-6 transition hover:shadow-[var(--shadow-card-hover)] ${
                  isPending ? "border-2 border-warning/60" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="font-mono font-bold text-ink">#{job.id.slice(-6).toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    {job.scheduledFor && (
                      <span className="flex items-center gap-1 text-accent-dark">
                        <Clock size={11} />
                        {new Date(job.scheduledFor).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {job.isUrgent && (
                      <span className="badge bg-danger-soft text-danger">
                        <AlertTriangle size={10} /> Urgent
                      </span>
                    )}
                    <StatusBadge status={job.status} />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <span className="icon-chip h-11 w-11 shrink-0 font-display text-lg">
                      {job.customerName.charAt(0)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink">{job.title}</h3>
                      <p className="text-xs text-ink-muted">
                        {job.customerName} · {job.customerPhone}
                      </p>
                      {job.jobAddress && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                          <MapPin size={12} className="text-accent" /> {job.jobAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-ink">
                      ₹{(job.confirmedTotal ?? job.initialEstimate).toFixed(0)}
                    </span>
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => respond(job.id, "reject")}
                          className="rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-ink-muted hover:border-danger hover:text-danger"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => respond(job.id, "accept")}
                          className="rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-accent-ink hover:brightness-110"
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/worker/jobs/${job.id}`}
                        className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-canvas hover:bg-accent"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
