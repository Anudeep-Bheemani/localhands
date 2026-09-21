"use client";

import { useState } from "react";

export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative mx-auto w-full max-w-3xl select-none">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-elevated)]">
        {/* after — clean/fixed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=750&fit=crop"
          alt="After — clean fixed work"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute bottom-4 right-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink shadow">
          After
        </div>

        {/* before — broken/messy — clipped */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=750&fit=crop"
            alt="Before — broken work"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas shadow">
            Before
          </div>
        </div>

        {/* divider line */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
          style={{ left: `${pos}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[var(--shadow-card)]"
          style={{ left: `${pos}%` }}
        >
          <span className="text-xs font-bold">↔</span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare before and after"
        className="absolute inset-x-0 top-0 h-full w-full cursor-ew-resize opacity-0"
      />

      <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <span>Before</span>
        <span>Drag to compare</span>
        <span>After</span>
      </div>
    </div>
  );
}
