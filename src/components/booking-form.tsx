"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, AlertTriangle } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";
import { VoiceRecorder } from "@/components/voice-recorder";

type WorkerService = { id: string; name: string; category: string; price: number };
type WorkerProduct = { id: string; name: string; price: number; stockQty: number };

export function BookingForm({
  worker,
  preselectedServiceId,
  initialProblem,
  initialPhotoUrl,
  initialVoiceUrl,
  jobLat,
  jobLng,
  jobAddress,
}: {
  worker: { id: string; name: string; services: WorkerService[]; products: WorkerProduct[] };
  preselectedServiceId: string | null;
  initialProblem: string;
  initialPhotoUrl: string | null;
  initialVoiceUrl: string | null;
  jobLat: number | null;
  jobLng: number | null;
  jobAddress: string;
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<string | null>(
    preselectedServiceId && worker.services.some((s) => s.id === preselectedServiceId)
      ? preselectedServiceId
      : worker.services[0]?.id ?? null
  );
  const [problem, setProblem] = useState(initialProblem);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(initialVoiceUrl);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = worker.services.find((s) => s.id === serviceId) ?? null;

  const productsTotal = useMemo(
    () =>
      worker.products.reduce((sum, p) => {
        const qty = quantities[p.id] ?? 0;
        return sum + p.price * qty;
      }, 0),
    [quantities, worker.products]
  );

  const estimate = (selectedService?.price ?? 0) + productsTotal;

  function setQty(productId: string, qty: number) {
    const max = worker.products.find((p) => p.id === productId)?.stockQty ?? 0;
    const clamped = Math.min(qty, max);
    setQuantities((prev) => {
      const next = { ...prev };
      if (clamped <= 0) delete next[productId];
      else next[productId] = clamped;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!problem.trim()) {
      setError("Describe what you need done");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: worker.id,
          serviceId,
          problemDescription: problem,
          problemVoiceNoteUrl: voiceUrl,
          problemPhotoUrl: photoUrl,
          jobLat,
          jobLng,
          jobAddress,
          isUrgent,
          products: Object.entries(quantities).map(([workerProductId, qty]) => ({ workerProductId, qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/customer/jobs/${data.job.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      <Section title="Service">
        <div className="grid gap-2 sm:grid-cols-2">
          {worker.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceId(s.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                serviceId === s.id ? "border-ink bg-canvas" : "border-border hover:border-ink"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{s.name}</p>
                <p className="text-xs text-ink-muted">{s.category}</p>
              </div>
              <span className="text-sm font-medium text-ink">₹{s.price.toFixed(0)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Describe the problem">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={3}
          className="input resize-none"
          placeholder="What exactly needs doing?"
        />
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <SinglePhotoUpload folder="problem-photos" value={photoUrl} onChange={setPhotoUrl} label="Photo" />
          <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} label="Voice note" />
        </div>
        <label className="mt-4 flex items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="accent-accent" />
          <AlertTriangle size={14} className="text-accent" />
          This is urgent — I need someone as soon as possible
        </label>
      </Section>

      {worker.products.length > 0 && (
        <Section title="Materials to bring (optional)">
          <div className="flex flex-col gap-2">
            {worker.products.map((p) => {
              const qty = quantities[p.id] ?? 0;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
                  <div>
                    <p className="text-sm text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">₹{p.price.toFixed(0)} each · {p.stockQty} available</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQty(p.id, qty - 1)} className="rounded-full border border-border p-1.5 text-ink-muted hover:border-ink hover:text-ink">
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-sm text-ink">{qty}</span>
                    <button type="button" onClick={() => setQty(p.id, qty + 1)} className="rounded-full border border-border p-1.5 text-ink-muted hover:border-ink hover:text-ink">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">Estimated total</p>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-sm text-ink-muted">
            {selectedService && <p>{selectedService.name}: ₹{selectedService.price.toFixed(0)}</p>}
            {productsTotal > 0 && <p>Materials: ₹{productsTotal.toFixed(0)}</p>}
          </div>
          <p className="font-display text-3xl text-ink">₹{estimate.toFixed(0)}</p>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          This is an estimate. The final scope and price are confirmed once {worker.name.split(" ")[0]} diagnoses the job.
        </p>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading || !serviceId}
        className="rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Sending request…" : `Send booking request to ${worker.name.split(" ")[0]}`}
      </motion.button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
