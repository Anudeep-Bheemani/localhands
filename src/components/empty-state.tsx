import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon size={20} />
      </span>
      <p className="mt-4 font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
