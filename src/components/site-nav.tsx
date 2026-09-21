"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
          scrolled
            ? "border border-border bg-surface/80 shadow-[var(--shadow-card)] backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <Link
          href="/"
          className={`font-display text-lg tracking-tight transition-colors ${scrolled ? "text-ink" : "text-white"}`}
        >
          LocalHands
        </Link>
        <div
          className={`hidden items-center gap-8 text-sm font-medium transition-colors md:flex ${
            scrolled ? "text-ink-muted" : "text-white/75"
          }`}
        >
          <a href="#how-it-works" className={scrolled ? "transition hover:text-ink" : "transition hover:text-white"}>
            How it works
          </a>
          <a href="#for-workers" className={scrolled ? "transition hover:text-ink" : "transition hover:text-white"}>
            For workers
          </a>
          <a href="#trust" className={scrolled ? "transition hover:text-ink" : "transition hover:text-white"}>
            Trust
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden px-4 py-2 text-sm font-medium transition sm:block ${
              scrolled ? "text-ink-muted hover:text-ink" : "text-white/75 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`group inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              scrolled ? "bg-ink text-canvas hover:bg-accent-dark" : "bg-white text-ink hover:bg-white/90"
            }`}
          >
            Get started
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
