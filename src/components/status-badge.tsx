const STATUS_CONFIG: Record<string, { label: string; className: string; dot?: string }> = {
  REQUESTED: { label: "Awaiting response", className: "bg-warning-soft text-warning", dot: "bg-warning animate-pulse" },
  BOOKED: { label: "Booked", className: "bg-info-soft text-info" },
  TRAVELLING: { label: "Travelling", className: "bg-accent-soft text-accent-dark", dot: "bg-accent animate-pulse" },
  ARRIVED: { label: "Arrived", className: "bg-info-soft text-info" },
  WORKING: { label: "Working", className: "bg-warning-soft text-warning", dot: "bg-warning" },
  COMPLETED: { label: "Completed", className: "bg-surface-subtle text-ink-muted" },
  REJECTED: { label: "Declined", className: "bg-danger-soft text-danger" },
  CANCELLED: { label: "Cancelled", className: "bg-surface-subtle text-ink-muted" },
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-surface-subtle text-ink-muted" };
  return (
    <span className={`badge ${cfg.className} ${className}`}>
      {cfg.dot && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
      {cfg.label}
    </span>
  );
}
