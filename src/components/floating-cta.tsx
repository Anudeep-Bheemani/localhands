"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8"
        >
          <MagneticButton>
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-canvas shadow-[var(--shadow-elevated)] transition hover:bg-accent-dark"
            >
              Get started
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
