"use client";

import { useState } from "react";
import { Star, Plus, Check } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";

type AdditionalWork = { id: string; description: string; extraCost: number; status: string };

type JobLike = {
  id: string;
  status: string;
  paymentStatus: string;
  additionalWork: AdditionalWork[];
  review: { id: string } | null;
  proposedScope: string | null;
  proposedTotal: number | null;
  scopeConfirmed: boolean;
};

const DIMS = [
  { key: "quality", label: "Work quality" },
  { key: "punctuality", label: "On-time arrival" },
  { key: "communication", label: "Communication" },
  { key: "pricingTransparency", label: "Pricing transparency" },
  { key: "professionalism", label: "Professionalism" },
] as const;

export function JobLifecycleActions({
  job,
  viewerRole,
  onUpdate,
}: {
  job: JobLike;
  viewerRole: "CUSTOMER" | "WORKER";
  onUpdate: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-8">
      {job.status === "ARRIVED" && (
        <ScopeSection job={job} viewerRole={viewerRole} onUpdate={onUpdate} />
      )}

      {viewerRole === "WORKER" && job.status === "WORKING" && (
        <AdditionalWorkForm jobId={job.id} onSubmitted={onUpdate} />
      )}

      {job.additionalWork.filter((a) => a.status === "PENDING").length > 0 && (
        <PendingAdditionalWork
          jobId={job.id}
          items={job.additionalWork.filter((a) => a.status === "PENDING")}
          viewerRole={viewerRole}
          onResolved={onUpdate}
        />
      )}

      {viewerRole === "WORKER" && ["WORKING", "ARRIVED"].includes(job.status) && (
        <EvidenceUploader jobId={job.id} onUploaded={onUpdate} />
      )}

      {viewerRole === "CUSTOMER" && job.status === "COMPLETED" && job.paymentStatus === "UNPAID" && (
        <PaymentSection jobId={job.id} onPaid={onUpdate} />
      )}

      {viewerRole === "CUSTOMER" && job.status === "COMPLETED" && job.paymentStatus === "PAID" && !job.review && (
        <ReviewForm jobId={job.id} onSubmitted={onUpdate} />
      )}

      {job.review && (
        <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-ink-muted">
          Review submitted — thanks for the feedback.
        </p>
      )}
    </div>
  );
}

function ScopeSection({
  job,
  viewerRole,
  onUpdate,
}: {
  job: JobLike;
  viewerRole: "CUSTOMER" | "WORKER";
  onUpdate: () => void;
}) {
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !total) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/scope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, total: Number(total) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setDescription("");
      setTotal("");
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function respond(approve: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/scope/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve }),
      });
      if (res.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  }

  if (job.scopeConfirmed) {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-accent-soft bg-accent-soft/30 px-5 py-3 text-sm text-ink">
        <Check size={15} className="text-accent" /> Scope confirmed at ₹{job.proposedTotal?.toFixed(0)} — work can begin.
      </p>
    );
  }

  // Customer sees a pending proposal to approve/decline
  if (job.proposedTotal != null) {
    if (viewerRole === "CUSTOMER") {
      return (
        <div className="rounded-2xl border border-accent-soft bg-accent-soft/30 p-5">
          <h3 className="font-display text-lg text-ink">Confirm final scope</h3>
          <p className="mt-2 text-sm text-ink">{job.proposedScope}</p>
          <p className="mt-1 font-display text-2xl text-ink">₹{job.proposedTotal.toFixed(0)}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => respond(true)}
              disabled={loading}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => respond(false)}
              disabled={loading}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-ink hover:border-ink disabled:opacity-50"
            >
              Ask for changes
            </button>
          </div>
        </div>
      );
    }
    return (
      <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-ink-muted">
        Waiting for the customer to confirm your proposed scope (₹{job.proposedTotal.toFixed(0)}).
      </p>
    );
  }

  // Worker proposes a scope
  if (viewerRole === "WORKER") {
    return (
      <form onSubmit={propose} className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-lg text-ink">Propose final scope & price</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Now that you&apos;ve diagnosed the job, confirm what you&apos;ll actually do and for how much before starting work.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What's the confirmed scope of work?"
            className="input resize-none"
          />
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="Final price ₹"
            className="input"
          />
        </div>
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send to customer for approval"}
        </button>
      </form>
    );
  }

  return (
    <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-ink-muted">
      Waiting for {viewerRole === "CUSTOMER" ? "the worker" : "the customer"} to confirm the final scope before work starts.
    </p>
  );
}

function AdditionalWorkForm({ jobId, onSubmitted }: { jobId: string; onSubmitted: () => void }) {
  const [description, setDescription] = useState("");
  const [extraCost, setExtraCost] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !extraCost) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/additional-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, extraCost: Number(extraCost), reason }),
      });
      if (res.ok) {
        setDescription("");
        setExtraCost("");
        setReason("");
        setOpen(false);
        onSubmitted();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 self-start rounded-full border border-dashed border-border px-4 py-2 text-sm text-ink-muted hover:border-ink hover:text-ink"
      >
        <Plus size={14} /> Request additional work
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-lg text-ink">Additional work request</h3>
      <div className="mt-3 flex flex-col gap-3">
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What extra work is needed?" className="input" />
        <input type="number" min={0} value={extraCost} onChange={(e) => setExtraCost(e.target.value)} placeholder="Extra cost ₹" className="input" />
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason (e.g. existing wiring damaged)" className="input resize-none" />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={loading} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50">
          {loading ? "Sending…" : "Send for approval"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-5 py-2 text-sm text-ink-muted hover:border-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

function PendingAdditionalWork({
  jobId,
  items,
  viewerRole,
  onResolved,
}: {
  jobId: string;
  items: AdditionalWork[];
  viewerRole: "CUSTOMER" | "WORKER";
  onResolved: () => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function respond(reqId: string, status: "APPROVED" | "DECLINED") {
    setLoadingId(reqId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/additional-work/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onResolved();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <h3 className="font-display text-lg text-ink">
        {viewerRole === "CUSTOMER" ? "Approval needed" : "Pending approval"}
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-accent-soft bg-accent-soft/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink">{item.description}</p>
              <p className="text-sm font-medium text-ink">₹{item.extraCost.toFixed(0)}</p>
            </div>
            {viewerRole === "CUSTOMER" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => respond(item.id, "APPROVED")}
                  disabled={loadingId === item.id}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => respond(item.id, "DECLINED")}
                  disabled={loadingId === item.id}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink hover:border-ink disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceUploader({ jobId, onUploaded }: { jobId: string; onUploaded: () => void }) {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);

  async function saveEvidence(photoUrl: string, type: "BEFORE" | "AFTER") {
    await fetch(`/api/jobs/${jobId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl, type }),
    });
    onUploaded();
  }

  return (
    <div>
      <h3 className="font-display text-lg text-ink">Work evidence</h3>
      <div className="mt-3 flex flex-wrap gap-6">
        <SinglePhotoUpload
          folder="job-evidence"
          value={before}
          onChange={(url) => {
            setBefore(url);
            if (url) saveEvidence(url, "BEFORE");
          }}
          label="Before photo"
        />
        <SinglePhotoUpload
          folder="job-evidence"
          value={after}
          onChange={(url) => {
            setAfter(url);
            if (url) saveEvidence(url, "AFTER");
          }}
          label="After photo"
        />
      </div>
    </div>
  );
}

function PaymentSection({ jobId, onPaid }: { jobId: string; onPaid: () => void }) {
  const [method, setMethod] = useState<"UPI" | "CARD" | "CASH">("UPI");
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (res.ok) onPaid();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-lg text-ink">Pay</h3>
      <div className="mt-3 flex gap-2">
        {(["UPI", "CARD", "CASH"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              method === m ? "border-ink bg-ink text-canvas" : "border-border text-ink-muted hover:border-ink"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <button
        onClick={pay}
        disabled={loading}
        className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}

function ReviewForm({ jobId, onSubmitted }: { jobId: string; onSubmitted: () => void }) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const allSet = DIMS.every((d) => values[d.key]);

  async function submit() {
    if (!allSet) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, comment }),
      });
      if (res.ok) onSubmitted();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-lg text-ink">Leave a review</h3>
      <div className="mt-3 flex flex-col gap-2.5">
        {DIMS.map((d) => (
          <div key={d.key} className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">{d.label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setValues((v) => ({ ...v, [d.key]: n }))}>
                  <Star
                    size={18}
                    className={n <= (values[d.key] ?? 0) ? "fill-accent text-accent" : "text-border"}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Anything else? (optional)"
        className="input mt-3 resize-none"
      />
      <button
        onClick={submit}
        disabled={!allSet || loading}
        className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas hover:bg-accent disabled:opacity-40"
      >
        {loading ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
