"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Phone, MessageCircle, AlertTriangle, Ban } from "lucide-react";
import Link from "next/link";
import { JobLifecycleActions } from "@/components/job-lifecycle-actions";
import { ReportIssueLink } from "@/components/report-issue-link";

const TrackingMap = dynamic(() => import("@/components/tracking-map").then((m) => m.TrackingMap), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-2xl border border-border bg-canvas" />,
});

const STEPS = [
  { key: "BOOKED", label: "Booked" },
  { key: "TRAVELLING", label: "Travelling" },
  { key: "ARRIVED", label: "Arrived" },
  { key: "WORKING", label: "Working" },
  { key: "COMPLETED", label: "Completed" },
] as const;

type JobData = {
  id: string;
  status: string;
  isUrgent: boolean;
  scheduledFor: string | null;
  problemDescription: string;
  problemVoiceNoteUrl: string | null;
  initialEstimate: number;
  confirmedTotal: number | null;
  paymentStatus: string;
  proposedScope: string | null;
  proposedTotal: number | null;
  scopeConfirmed: boolean;
  cancelledBy: "CUSTOMER" | "WORKER" | null;
  cancellationReason: string;
  jobAddress: string;
  jobLat: number | null;
  jobLng: number | null;
  travelStartLat: number | null;
  travelStartLng: number | null;
  travelEndLat: number | null;
  travelEndLng: number | null;
  travelStartedAt: string | null;
  travelDurationSeconds: number | null;
  customer: { id: string; name: string; phone: string };
  worker: { userId: string; baseLat: number; baseLng: number; user: { name: string; phone: string } };
  service: { name: string; category: { name: string } } | null;
  jobProducts: { id: string; qty: number; priceAtTime: number; workerProduct: { name: string } }[];
  additionalWork: { id: string; description: string; extraCost: number; status: string }[];
  statusHistory: { id: string; status: string; timestamp: string; note: string }[];
  evidence: { id: string; photoUrl: string; type: string }[];
  review: { id: string } | null;
};

export function JobWorkspace({ initialJob, viewerRole }: { initialJob: JobData; viewerRole: "CUSTOMER" | "WORKER" }) {
  const router = useRouter();
  const [job, setJob] = useState<JobData>(initialJob);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (job.status !== "TRAVELLING") return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [job.status]);

  async function refetch() {
    const res = await fetch(`/api/jobs/${job.id}`);
    if (res.ok) {
      const data = await res.json();
      setJob(data.job);
    }
  }

  useEffect(() => {
    if (["REJECTED", "CANCELLED"].includes(job.status)) return;
    const interval = setInterval(refetch, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id, job.status]);

  async function runAction(action: string, reason?: string) {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/jobs/${job.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setJob(data.job as JobData);
        router.refresh();
      }
    } finally {
      setActionLoading(null);
    }
  }

  const canCancel =
    viewerRole === "CUSTOMER"
      ? ["REQUESTED", "BOOKED"].includes(job.status)
      : ["REQUESTED", "BOOKED", "TRAVELLING", "ARRIVED"].includes(job.status);

  const productsTotal = job.jobProducts.reduce((s, p) => s + p.qty * p.priceAtTime, 0);
  const serviceEstimate = job.initialEstimate - productsTotal;
  const approvedAdditions = job.additionalWork
    .filter((a) => a.status === "APPROVED")
    .reduce((s, a) => s + a.extraCost, 0);
  const runningTotal = (job.confirmedTotal ?? job.initialEstimate) + approvedAdditions;

  const otherParty = viewerRole === "CUSTOMER" ? job.worker.user : job.customer;
  const stepIndex = STEPS.findIndex((s) => s.key === job.status);

  const canPollTravel =
    job.status === "TRAVELLING" && job.travelStartedAt && job.travelDurationSeconds != null;
  const travelElapsed = canPollTravel
    ? (now - new Date(job.travelStartedAt!).getTime()) / 1000
    : 0;
  const travelDone = canPollTravel && travelElapsed >= (job.travelDurationSeconds ?? 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {job.isUrgent && (
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <AlertTriangle size={12} /> Urgent
            </span>
          )}
          <h1 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
            {job.service ? `${job.service.category.name} — ${job.service.name}` : "Custom job"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Job #{job.id.slice(-6).toUpperCase()} · {otherParty.name}
          </p>
          {job.scheduledFor && (
            <p className="mt-1 text-xs text-ink-muted">
              Scheduled for {new Date(job.scheduledFor).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </div>
        {job.status !== "REQUESTED" && job.status !== "REJECTED" && (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${otherParty.phone}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-ink"
            >
              <Phone size={14} /> Call
            </a>
            <Link
              href={`/${viewerRole.toLowerCase()}/jobs/${job.id}/chat`}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-ink"
            >
              <MessageCircle size={14} /> Chat
            </Link>
          </div>
        )}
      </div>

      {/* Status stepper */}
      {job.status === "REQUESTED" ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink">
            {viewerRole === "WORKER"
              ? "New booking request — accept or decline."
              : `Waiting for ${otherParty.name.split(" ")[0]} to respond…`}
          </p>
          {viewerRole === "WORKER" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => runAction("accept")}
                disabled={!!actionLoading}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => runAction("reject")}
                disabled={!!actionLoading}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-ink hover:border-ink disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ) : job.status === "REJECTED" ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm text-ink-muted">
          This request was declined.
        </div>
      ) : job.status === "CANCELLED" ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm text-ink-muted">
          Cancelled by {job.cancelledBy === "CUSTOMER" ? "the customer" : "the worker"}
          {job.cancellationReason ? ` — "${job.cancellationReason}"` : "."}
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-5">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    i < stepIndex
                      ? "bg-ink text-canvas"
                      : i === stepIndex
                      ? "bg-accent text-accent-ink"
                      : "bg-canvas text-ink-muted"
                  }`}
                >
                  {i < stepIndex ? <Check size={13} /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-[11px] ${i <= stepIndex ? "text-ink" : "text-ink-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${i < stepIndex ? "bg-ink" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {job.status === "TRAVELLING" && job.travelStartLat != null && (
        <div className="mt-6">
          <TrackingMap
            startLat={job.travelStartLat}
            startLng={job.travelStartLng!}
            endLat={job.travelEndLat!}
            endLng={job.travelEndLng!}
            startedAt={job.travelStartedAt!}
            durationSeconds={job.travelDurationSeconds!}
          />
        </div>
      )}

      {viewerRole === "WORKER" && !["REQUESTED", "REJECTED", "COMPLETED"].includes(job.status) && (
        <div className="mt-6 flex justify-end">
          {job.status === "BOOKED" && (
            <ActionButton onClick={() => runAction("start_travel")} loading={actionLoading === "start_travel"}>
              Start travelling
            </ActionButton>
          )}
          {job.status === "TRAVELLING" && (
            <ActionButton onClick={() => runAction("arrive")} loading={actionLoading === "arrive"} disabled={!travelDone}>
              {travelDone ? "Mark arrived" : "Arriving…"}
            </ActionButton>
          )}
          {job.status === "ARRIVED" && (
            <ActionButton
              onClick={() => runAction("start_work")}
              loading={actionLoading === "start_work"}
              disabled={!job.scopeConfirmed}
            >
              {job.scopeConfirmed ? "Start work" : "Confirm scope first"}
            </ActionButton>
          )}
          {job.status === "WORKING" && (
            <ActionButton onClick={() => runAction("complete")} loading={actionLoading === "complete"}>
              Mark complete
            </ActionButton>
          )}
        </div>
      )}

      {canCancel && (
        <div className="mt-4 flex justify-end">
          {cancelling ? (
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-ink">Cancel this booking?</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Reason (optional)"
                className="input mt-2 resize-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => runAction("cancel", cancelReason)}
                  disabled={actionLoading === "cancel"}
                  className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:bg-accent disabled:opacity-50"
                >
                  {actionLoading === "cancel" ? "Cancelling…" : "Confirm cancellation"}
                </button>
                <button
                  onClick={() => setCancelling(false)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink-muted hover:border-ink"
                >
                  Never mind
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCancelling(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent"
            >
              <Ban size={13} /> Cancel booking
            </button>
          )}
        </div>
      )}

      {/* Problem */}
      <section className="mt-8">
        <h2 className="font-display text-lg text-ink">The job</h2>
        <p className="mt-2 text-sm text-ink-muted">{job.problemDescription || "No description provided."}</p>
        {job.problemVoiceNoteUrl && <audio controls src={job.problemVoiceNoteUrl} className="mt-3 h-9 w-full max-w-sm" />}
        {job.jobAddress && <p className="mt-2 text-xs text-ink-muted">📍 {job.jobAddress}</p>}
      </section>

      {/* Cost */}
      <section className="mt-8">
        <h2 className="font-display text-lg text-ink">Cost</h2>
        <div className="mt-3 rounded-2xl border border-border bg-surface p-5">
          <Row label={job.service?.name ?? "Custom job"} value={serviceEstimate} />
          {job.jobProducts.map((p) => (
            <Row key={p.id} label={`${p.workerProduct.name} × ${p.qty}`} value={p.qty * p.priceAtTime} muted />
          ))}
          {job.additionalWork
            .filter((a) => a.status === "APPROVED")
            .map((a) => (
              <Row key={a.id} label={`${a.description} (approved extra)`} value={a.extraCost} muted />
            ))}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-ink">
              {job.status === "COMPLETED" ? "Total" : "Estimated total"}
            </span>
            <span className="font-display text-xl text-ink">₹{runningTotal.toFixed(0)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-ink-muted">
            <span>Payment: {job.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</span>
            {viewerRole === "CUSTOMER" && job.paymentStatus === "PAID" && (
              <Link href={`/customer/jobs/${job.id}/invoice`} className="font-medium text-accent hover:underline">
                View invoice →
              </Link>
            )}
          </div>
        </div>
      </section>

      {!["REQUESTED", "REJECTED"].includes(job.status) && (
        <JobLifecycleActions job={job} viewerRole={viewerRole} onUpdate={refetch} />
      )}

      {/* Evidence */}
      {job.evidence.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink">Work evidence</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {job.evidence.map((e) => (
              <div key={e.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.photoUrl} alt={e.type} className="aspect-square rounded-xl object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] text-canvas">
                  {e.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 border-t border-border pt-4">
        <ReportIssueLink jobId={job.id} />
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${muted ? "text-ink-muted" : "text-ink"}`}>{label}</span>
      <span className={`text-sm ${muted ? "text-ink-muted" : "text-ink"}`}>₹{value.toFixed(0)}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading || disabled}
      className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent disabled:opacity-40"
    >
      {loading ? "Updating…" : children}
    </motion.button>
  );
}
