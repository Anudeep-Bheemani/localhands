"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // Starts false on both server and the client's first (hydration) render —
  // matchMedia is only read after mount, in the effect below, so SSR output
  // never disagrees with the client's initial render.
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)");
    // Reading a browser-only API (matchMedia) that doesn't exist during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(mql.matches);
    const onChange = () => setEnabled(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let ringX = 0;
    let ringY = 0;
    let targetX = 0;
    let targetY = 0;
    let frame: number;

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement;
      setHovering(!!target.closest("a, button, [data-cursor='hover']"));
    }

    function tick() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-1.5 w-1.5 rounded-full bg-ink"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border transition-[width,height,border-color,background-color] duration-200 ${
          hovering ? "h-11 w-11 border-accent bg-accent/10" : "h-7 w-7 border-ink/30 bg-transparent"
        }`}
        style={{ willChange: "transform" }}
      />
    </>
  );
}
