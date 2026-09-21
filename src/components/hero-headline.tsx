"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroHeadline({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <motion.h1 variants={container} initial="hidden" animate="show" className={className}>
      {lines.map((text, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span variants={line} className="block">
            {text}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
