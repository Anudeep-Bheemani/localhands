import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Wallet, CheckCircle2, Star } from "lucide-react";

export default async function WorkerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.profileComplete) redirect("/worker/onboarding");

  const stats = [
    { label: "Total earned", value: `₹${profile.totalEarned.toFixed(0)}`, icon: Wallet },
    { label: "Jobs completed", value: profile.jobsCompleted, icon: CheckCircle2 },
    {
      label: "Average rating",
      value: profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "—",
      icon: Star,
    },
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
    </div>
  );
}
