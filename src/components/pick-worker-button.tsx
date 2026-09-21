"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PickWorkerButton({ customJobId, workerId }: { customJobId: string; workerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/custom-jobs/${customJobId}/pick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/customer/jobs/${data.job.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={pick}
      disabled={loading}
      className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
    >
      {loading ? "Choosing…" : "Choose"}
    </button>
  );
}
