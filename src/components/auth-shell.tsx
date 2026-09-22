"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  image,
  quote,
  quoteAuthor,
  children,
}: {
  image: string;
  quote: string;
  quoteAuthor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      {/* Photo panel */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <BrandLogo compact dark />
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-sm"
          >
            <p className="font-display text-2xl leading-snug text-white">&ldquo;{quote}&rdquo;</p>
            <cite className="mt-3 block text-sm not-italic text-white/60">{quoteAuthor}</cite>
          </motion.blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <BrandLogo compact />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
