import Link from "next/link";

export function BrandLogo({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="LocalHands home"
      className={`group inline-flex shrink-0 items-center gap-2.5 ${dark ? "text-white" : "text-ink"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/localhands-logo.png"
        alt="LocalHands"
        className={`${compact ? "h-9 w-9 rounded-lg p-1" : "h-11 w-11 rounded-xl"} bg-ink object-contain transition-transform duration-300 group-hover:scale-105`}
      />
      <span className={`font-display tracking-tight ${compact ? "text-xl" : "text-3xl"}`}>
        LocalHands
      </span>
    </Link>
  );
}
