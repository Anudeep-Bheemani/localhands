import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Wallet, CheckCircle2, Star, Clock, Loader2, XCircle, Ban,
  ArrowRight, MapPin, Wrench, Package, Award,
} from "lucide-react";
import { IncomingRequestCard } from "@/components/incoming-request-card";

const ACTIVE_STATUSES = ["BOOKED", "TRAVELLING", "ARRIVED", "WORKING"] as const;

export default async function WorkerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.profileComplete) redirect("/worker/onboarding");

  const [statusCounts, pendingRequest, activeJob] = await Promise.all([
    prisma.job.groupBy({ by: ["status"], where: { workerId: user.id }, _count: true }),
    prisma.job.findFirst({
      where: { workerId: user.id, status: "REQUESTED" },
      include: { customer: true, service: { include: { category: true } }, customJob: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.job.findFirst({
      where: { workerId: user.id, status: { in: [...ACTIVE_STATUSES] } },
      include: { customer: true, service: { include: { category: true } }, customJob: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const countOf = (statuses: readonly string[]) =>
    statusCounts.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s._count, 0);

  const stats = [
    { label: "Total earned", value: `₹${profile.totalEarned.toFixed(0)}`, icon: Wallet },
    { label: "Jobs completed", value: profile.jobsCompleted, icon: CheckCircle2 },
    { label: "Average rating", value: profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "—", icon: Star },
    {
      label: "Availability",
      value: profile.availableNow ? "Available now" : "Not available",
      icon: Clock,
      accent: profile.availableNow,
    },
  ];

  const report = [
    { label: "Pending requests", value: countOf(["REQUESTED"]), icon: Clock, href: "/worker/jobs" },
    { label: "Ongoing", value: countOf(ACTIVE_STATUSES), icon: Loader2, href: "/worker/schedule" },
    { label: "Completed", value: countOf(["COMPLETED"]), icon: CheckCircle2, href: "/worker/jobs" },
    { label: "Declined", value: countOf(["REJECTED"]), icon: XCircle, href: "/worker/jobs" },
    { label: "Cancelled", value: countOf(["CANCELLED"]), icon: Ban, href: "/worker/jobs" },
  ];

  const quickActions = [
    { label: "Edit services", desc: "Update pricing & skills", icon: Wrench, href: "/worker/profile" },
    { label: "Inventory", desc: "Manage materials on hand", icon: Package, href: "/worker/profile" },
    { label: "Reviews", desc: "See what customers say", icon: Star, href: "/worker/reviews" },
    { label: "Worker passport", desc: "Your public profile", icon: Award, href: `/workers/${user.id}` },
  ];

  const titleOf = (j: { service: { category: { name: string }; name: string } | null; customJob: unknown }) =>
    j.service ? `${j.service.category.name} — ${j.service.name}` : j.customJob ? "Custom job" : "Job";

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-ink-muted">Here&apos;s how your business is doing.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-ink-muted">{label}</span>
              <span className="icon-chip h-8 w-8">
                <Icon size={15} />
              </span>
            </div>
            <p className={`mt-3 font-display text-2xl ${accent ? "text-accent-dark" : "text-ink"}`}>{value}</p>
          </div>
        ))}
      </div>

      {pendingRequest && (
        <div className="mt-8">
          <IncomingRequestCard
            request={{
              id: pendingRequest.id,
              title: titleOf(pendingRequest),
              customerName: pendingRequest.customer.name,
              jobAddress: pendingRequest.jobAddress,
              isUrgent: pendingRequest.isUrgent,
              initialEstimate: pendingRequest.initialEstimate,
              createdAt: pendingRequest.createdAt.toISOString(),
            }}
          />
        </div>
      )}

      {activeJob && (
        <Link
          href={`/worker/jobs/${activeJob.id}`}
          className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-accent-dark to-accent p-6 text-white shadow-[var(--shadow-elevated)] sm:flex-row sm:items-center"
        >
          <div className="max-w-xl space-y-1">
            <span className="badge bg-white/15 text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Active job in progress
            </span>
            <h3 className="text-lg font-bold">{titleOf(activeJob)}</h3>
            <p className="flex items-center gap-1 text-xs text-white/80">
              <MapPin size={12} /> {activeJob.customer.name} · {activeJob.jobAddress}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-accent-dark transition group-hover:bg-white/90">
            Open job workspace <ArrowRight size={16} />
          </span>
        </Link>
      )}

      <h2 className="mt-10 font-display text-lg text-ink">Job report</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {report.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-2xl border border-border bg-surface p-4 transition hover:border-accent">
            <Icon size={15} className="text-ink-muted" />
            <p className="mt-2 font-display text-xl text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg text-ink">Quick actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map(({ label, desc, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-4 transition hover:border-accent">
            <span className="icon-chip h-9 w-9">
              <Icon size={16} />
            </span>
            <p className="mt-3 text-sm font-bold text-ink group-hover:text-accent-dark">{label}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
