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
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex items-center gap-5 px-8 pt-5 sm:px-12"
    >
      {/* Logo */}
      <Link href="/" className="group flex shrink-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scrolled ? "/localhands-logo-navy.png" : "/localhands-logo.png"}
          alt="LocalHands"
          className="h-16 w-16 object-contain transition-transform group-hover:scale-105"
        />
        <span className={`font-display text-[1.6rem] tracking-tight transition-all ${
          scrolled ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]" : "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        }`}>
          LocalHands
        </span>
      </Link>

      {/* Nav pill */}
      <div className={`flex flex-1 items-center rounded-2xl px-6 py-2.5 transition-all duration-500 ${
        scrolled
          ? "border border-white/10 bg-transparent backdrop-blur-xl"
          : "border border-white/15 bg-white/10 backdrop-blur-lg"
      }`}>
        {/* Nav links — equally spaced in the center */}
        <div className="flex flex-1 items-center justify-evenly">
          {[
            { label: "How it works", href: "#how-it-works" },
            { label: "For workers", href: "#for-workers" },
            { label: "Trust", href: "#trust" },
            { label: "Help & Support", href: "/help" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                scrolled
                  ? "text-white/80 hover:bg-white/15 hover:text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              scrolled ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              scrolled
                ? "bg-white/95 text-gray-900 shadow-[0_3px_12px_-2px_rgba(0,0,0,0.15)] hover:bg-white"
                : "bg-white/95 text-gray-900 shadow-[0_3px_12px_-2px_rgba(0,0,0,0.15)] hover:bg-white"
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
