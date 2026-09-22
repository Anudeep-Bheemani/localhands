export function GradientBlobs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      <div
        className="animate-blob absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}
