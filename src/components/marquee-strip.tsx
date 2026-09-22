export function MarqueeStrip({
  items,
  className = "",
  dark = false,
}: {
  items: string[];
  className?: string;
  dark?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y ${dark ? "border-white/10 bg-ink" : "border-border bg-surface"} py-5 ${className}`}>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`flex items-center gap-10 font-display text-2xl sm:text-3xl ${dark ? "text-white/25" : "text-ink/15"}`}
          >
            {item}
            <span className={dark ? "text-accent/70" : "text-accent"}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
