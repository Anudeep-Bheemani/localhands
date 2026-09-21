"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

type Job = {
  id: string;
  status: string;
  isUrgent: boolean;
  scheduledFor: string | null;
  customerName: string;
  jobAddress: string;
  title: string;
};

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ScheduleView({ jobs }: { jobs: Job[] }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const [selected, setSelected] = useState(() => dateKey(days[0]));

  const unscheduled = jobs.filter((j) => !j.scheduledFor);
  const scheduled = jobs.filter((j) => j.scheduledFor);

  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const j of scheduled) {
      const key = j.scheduledFor!.slice(0, 10);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [scheduled]);

  const dayJobs = scheduled
    .filter((j) => j.scheduledFor!.slice(0, 10) === selected)
    .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));

  const selectedLabel = new Date(selected + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mt-6 flex flex-col gap-8">
      {unscheduled.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-ink">Needs scheduling ({unscheduled.length})</h2>
          <p className="text-xs text-ink-muted">Accepted or pending jobs without a specific time — handle these first.</p>
          <div className="mt-3 flex flex-col gap-2">
            {unscheduled.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const key = dateKey(d);
            const active = key === selected;
            const count = countByDay[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`rounded-2xl border p-3 text-center transition ${
                  active ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase text-ink-muted">
                  {d.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-ink">{d.getDate()}</span>
                {count > 0 && (
                  <span className="mt-1 inline-block rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-ink">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="card mt-4 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-ink">{selectedLabel}</h3>
            <span className="text-xs font-bold text-accent-dark">
              {dayJobs.length} {dayJobs.length === 1 ? "visit" : "visits"}
            </span>
          </div>

          {dayJobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">Nothing scheduled for this day.</p>
          ) : (
            <div className="relative mt-5 space-y-5 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-accent-soft">
              {dayJobs.map((job) => (
                <div key={job.id} className="relative">
                  <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full bg-accent ring-4 ring-surface" />
                  <div className="rounded-2xl border border-border bg-surface-subtle p-4 transition hover:border-accent">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-accent px-2.5 py-1 font-mono text-xs font-bold text-accent-ink">
                          {new Date(job.scheduledFor!).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <h4 className="text-sm font-bold text-ink">{job.title}</h4>
                        {job.isUrgent && <AlertTriangle size={13} className="text-danger" />}
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="mt-2 text-xs text-ink-muted">
                      <p>
                        Customer: <strong className="text-ink">{job.customerName}</strong>
                      </p>
                      {job.jobAddress && (
                        <p className="mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="text-accent" /> {job.jobAddress}
                        </p>
                      )}
                    </div>
                    <Link href={`/worker/jobs/${job.id}`} className="mt-2 inline-block text-xs font-bold text-accent-dark hover:underline">
                      Open job →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  return (
    <Link
      href={`/worker/jobs/${job.id}`}
      className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition hover:border-accent"
    >
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-ink">{job.title}</h4>
          {job.isUrgent && <AlertTriangle size={13} className="text-danger" />}
        </div>
        <p className="text-xs text-ink-muted">{job.customerName}</p>
        {job.jobAddress && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
            <MapPin size={12} className="text-accent" /> {job.jobAddress}
          </p>
        )}
      </div>
      <StatusBadge status={job.status} />
    </Link>
  );
}
