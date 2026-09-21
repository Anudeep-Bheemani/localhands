"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Wrench, ChefHat, Zap } from "lucide-react";

const WORKERS = [
  { name: "Ravi", rating: 4.9, trade: "Plumbing", distance: "2.1 km away", icon: Wrench, x: "4%", y: "8%", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Priya", rating: 4.8, trade: "Cooking", distance: "1.4 km away", icon: ChefHat, x: "56%", y: "0%", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { name: "Arjun", rating: 4.9, trade: "Electrical", distance: "3.2 km away", icon: Zap, x: "24%", y: "58%", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-square">
      {/* base map-like panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-accent-soft/70 via-surface to-surface shadow-[var(--shadow-elevated)]"
      >
        {/* neighbourhood background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=800&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.25]" aria-hidden>
          <defs>
            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--accent)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* pulsing center pin = "you" */}
        <motion.div
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-canvas shadow-[var(--shadow-card)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <MapPin size={20} />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-ink/40"
            animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* floating worker cards */}
      {WORKERS.map(({ name, rating, trade, distance, photo, x, y }, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: x, top: y }}
          className="absolute w-[168px]"
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
            className="rounded-2xl border border-border bg-surface/95 p-3.5 shadow-[var(--shadow-card)] backdrop-blur-sm"
          >
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{name}</p>
                <p className="truncate text-[11px] text-ink-muted">{trade}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-accent-dark">
                <Star size={11} fill="currentColor" /> {rating}
              </span>
              <span className="text-ink-muted">{distance}</span>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
