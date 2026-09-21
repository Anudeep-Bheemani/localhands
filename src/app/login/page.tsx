"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      const actualRole = data.user.role as "CUSTOMER" | "WORKER";
      if (actualRole !== role) {
        setNotice(
          `This account is registered as a ${actualRole === "WORKER" ? "worker" : "customer"} — taking you to your ${
            actualRole === "WORKER" ? "worker" : "customer"
          } dashboard.`
        );
      }
      router.push(actualRole === "WORKER" ? "/worker" : "/customer");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80&fit=crop"
      quote="I found an electrician in eight minutes, watched him arrive on the map, and paid once the job was actually done."
      quoteAuthor="Anjali Verma, customer"
    >
      <h1 className="font-display text-3xl tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Log in to continue.</p>

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
                layoutId="login-role-pill"
                className="absolute inset-0 rounded-full bg-surface shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{r === "CUSTOMER" ? "I need a service" : "I'm a worker"}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input mt-1.5"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {notice && <p className="text-sm text-info">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? "Logging in…" : `Log in as ${role === "CUSTOMER" ? "a customer" : "a worker"}`}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
