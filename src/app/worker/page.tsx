import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Wallet, CheckCircle2, Star, Clock, Loader2, XCircle, Ban } from "lucide-react";

export default async function WorkerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.profileComplete) redirect("/worker/onboarding");

  const statusCounts = await prisma.job.groupBy({
    by: ["status"],
    where: { workerId: user.id },
    _count: true,
  });
  const countOf = (statuses: string[]) =>
    statusCounts.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s._count, 0);

  const stats = [
    { label: "Total earned", value: `₹${profile.totalEarned.toFixed(0)}`, icon: Wallet },
    { label: "Jobs completed", value: profile.jobsCompleted, icon: CheckCircle2 },
    { label: "Average rating", value: profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "—", icon: Star },
  ];

  const report = [
    { label: "Pending requests", value: countOf(["REQUESTED"]), icon: Clock, href: "/worker/schedule" },
    { label: "Ongoing", value: countOf(["BOOKED", "TRAVELLING", "ARRIVED", "WORKING"]), icon: Loader2, href: "/worker/schedule" },
    { label: "Completed", value: countOf(["COMPLETED"]), icon: CheckCircle2, href: "/worker/jobs" },
    { label: "Declined", value: countOf(["REJECTED"]), icon: XCircle, href: "/worker/jobs" },
    { label: "Cancelled", value: countOf(["CANCELLED"]), icon: Ban, href: "/worker/jobs" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-ink-muted">Here&apos;s how your business is doing.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-6">
            <Icon size={18} className="text-accent" />
            <p className="mt-4 text-sm text-ink-muted">{label}</p>
            <p className="mt-1 font-display text-3xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg text-ink">Job report</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {report.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-border bg-surface p-4 transition hover:border-ink">
            <Icon size={15} className="text-ink-muted" />
            <p className="mt-2 font-display text-xl text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
