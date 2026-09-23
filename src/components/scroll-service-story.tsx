"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin, Star } from "lucide-react";

const SERVICES = [
  {
    number: "01",
    label: "Electrical",
    title: "Power, made human.",
    body: "From a flickering switchboard to a full home rewiring, find the local expert who knows the work.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&h=1800&fit=crop&q=85",
    accent: "#f3b340",
    meta: "4.9 average rating",
    count: "148 workers",
  },
  {
    number: "02",
    label: "Plumbing",
    title: "Flow, restored.",
    body: "Leaks, fittings, full bathroom work. See who is nearby, available, and ready to make it right.",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1400&h=1800&fit=crop&q=85",
    accent: "#61b7d8",
    meta: "4.8 average rating",
    count: "96 workers",
  },
  {
    number: "03",
    label: "Cleaning",
    title: "A fresh start, nearby.",
    body: "Deep cleans, move-outs, and the jobs that make a place feel like yours again.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&h=1800&fit=crop&q=85",
    accent: "#91c9a4",
    meta: "4.9 average rating",
    count: "122 workers",
  },
  {
    number: "04",
    label: "Cooking",
    title: "Good food, close to home.",
    body: "Find a cook for tonight, a celebration, or the rhythm of every week.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=1800&fit=crop&q=85",
    accent: "#e98f6c",
    meta: "4.8 average rating",
    count: "74 workers",
  },
  {
    number: "05",
    label: "Moving",
    title: "Big jobs, lighter.",
    body: "Careful hands for the cupboard, the boxes, and everything that needs to get there safely.",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1400&h=1800&fit=crop&q=85",
    accent: "#b294d8",
    meta: "4.7 average rating",
    count: "61 workers",
  },
];

export function ScrollServiceStory() {
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(SERVICES.length - 1, Math.floor(latest * SERVICES.length + 0.5));
    setActiveIndex(nextIndex);
  });

  const active = SERVICES[activeIndex];
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative h-[500vh] bg-ink text-white">
      <div className="sticky top-0 h-[100svh] min-h-[680px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(226,83,12,0.2),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(35,95,168,0.18),transparent_30%)]" />
        <div className="absolute inset-y-0 left-0 w-px bg-white/10 sm:left-[8vw]" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/10 sm:right-[8vw]" />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-6 py-7 sm:px-12 lg:px-20">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            <span>Find the right hands</span>
            <span>Scroll to explore</span>
          </div>

          <div className="relative flex flex-1 items-center">
            <div className="relative z-10 w-full max-w-[560px] pb-10 pt-16 lg:pt-24">
              <motion.p
                key={`${active.number}-label`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45 }}
                className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: active.accent }}
              >
                {active.number} / {String(SERVICES.length).padStart(2, "0")} · {active.label}
              </motion.p>
              <motion.h2
                key={`${active.number}-title`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.04 }}
                className="mt-5 max-w-xl font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.88] tracking-tight"
              >
                {active.title}
              </motion.h2>
              <motion.p
                key={`${active.number}-body`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
                className="mt-7 max-w-md text-base leading-7 text-white/60 sm:text-lg"
              >
                {active.body}
              </motion.p>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-white/55">
                <span className="flex items-center gap-1.5"><Star size={14} fill="currentColor" style={{ color: active.accent }} /> {active.meta}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} style={{ color: active.accent }} /> {active.count} nearby</span>
              </div>
              <Link href={`/signup?category=${active.label.toLowerCase()}`} className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-white/90">
                Explore {active.label.toLowerCase()}
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="pointer-events-none absolute right-[-18vw] top-1/2 h-[min(78vw,780px)] w-[min(58vw,650px)] -translate-y-1/2 sm:right-[-7vw] lg:right-[2vw]">
              <div className="absolute inset-[8%] rounded-full border border-white/10" />
              <div className="absolute inset-[18%] rounded-full border border-white/10" />
              <div className="absolute right-[12%] top-[12%] h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: active.accent, opacity: 0.25 }} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.number}
                  initial={{ opacity: 0, x: 90, rotate: 7, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, rotate: -3, scale: 1 }}
                  exit={{ opacity: 0, x: -90, rotate: -7, scale: 0.94 }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative aspect-[0.76] w-[min(48vw,460px)] overflow-hidden rounded-[2.5rem] border border-white/20 bg-surface p-2 shadow-[0_40px_100px_-25px_rgba(0,0,0,0.75)] sm:p-3">
                    <div className="relative h-full overflow-hidden rounded-[2rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={active.image} alt={active.label} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-white/10" />
                      <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
                        <span className="font-display text-5xl text-white/90 sm:text-6xl">{active.number}</span>
                        <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
                          {active.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex items-center gap-5 pb-1">
            <div className="h-px flex-1 bg-white/15">
              <motion.div style={{ width: progressWidth, backgroundColor: active.accent }} className="h-full" />
            </div>
            <div className="flex gap-1.5">
              {SERVICES.map((service, index) => (
                <span key={service.number} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-8" : "w-1.5 bg-white/25"}`} style={index === activeIndex ? { backgroundColor: active.accent } : undefined} />
              ))}
            </div>
            <ChevronDown size={16} className="text-white/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
