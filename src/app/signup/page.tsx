"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(role === "WORKER" ? "/worker/onboarding" : "/customer");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-10"
      >
        <Link href="/" className="font-display italic text-lg text-ink-muted">
          LocalHands
        </Link>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Local work, connected.</p>

        <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-full border border-border bg-canvas p-1.5">
          {(["CUSTOMER", "WORKER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative rounded-full py-2 text-sm font-medium transition ${
                role === r ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {role === r && (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 rounded-full bg-surface shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{r === "CUSTOMER" ? "I need a service" : "I'm a worker"}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 90000 00000"
              className="input"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
