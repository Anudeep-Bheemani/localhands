"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      router.push(data.user.role === "WORKER" ? "/worker" : "/customer");
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
        <h1 className="mt-4 font-display text-3xl tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Local work, connected.</p>

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

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-ink-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
