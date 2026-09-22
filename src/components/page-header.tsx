import type { ReactNode } from "react";
import { GradientBlobs } from "@/components/gradient-blobs";

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
  return (
    <div
      className={`relative overflow-hidden pb-10 ${
        contained ? "-mt-2 rounded-[1.75rem] border border-border bg-surface px-6 pt-8" : "-mx-6 -mt-10 px-6 pt-10"
      }`}
    >
      <GradientBlobs />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-accent-dark">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-5xl">{title}</h1>
          {description && <p className="mt-2 max-w-xl text-ink-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
