"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroHeadline } from "@/components/hero-headline";
import { MagneticButton } from "@/components/magnetic-button";

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.28]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <motion.div style={{ scale: imgScale }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1800&q=80&fit=crop"
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-24 pt-32 sm:pb-28"
      >
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
          Local work, connected
        </span>

        <HeroHeadline
          lines={["Help is closer", "than you think."]}
          className="mt-6 font-display text-[15vw] font-medium leading-[0.95] tracking-tight text-white sm:text-7xl md:text-[6.4rem] lg:text-[7.2rem]"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-lg text-lg text-white/75"
        >
          Describe the job. See who&apos;s nearby, right now. Pick the person —
          not an algorithm — and watch it get done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <MagneticButton>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              Find a worker
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              href="/signup"
              className="inline-flex rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/70"
            >
              Become a worker
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center text-white/50"
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
