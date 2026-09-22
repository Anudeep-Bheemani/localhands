import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  contained = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** true when nested inside a narrower max-w wrapper — skips the edge-to-edge bleed */
  contained?: boolean;
}) {
  if (contained) {
    return (
      <div className="relative -mt-2 overflow-hidden rounded-[2rem] bg-ink px-8 pb-9 pt-8 text-white shadow-[var(--shadow-elevated)] sm:px-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-white/65">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mx-10 -mt-12 overflow-hidden bg-ink px-10 pb-14 pt-14 text-white">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent-dark) 0%, transparent 70%)" }}
      />
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl">{title}</h1>
          {description && <p className="mt-4 max-w-xl text-lg text-white/65">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
