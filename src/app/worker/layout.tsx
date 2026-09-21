import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { WORKER_NAV } from "@/lib/nav-items";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const pendingCount = await prisma.job.count({ where: { workerId: user.id, status: "REQUESTED" } });

  return (
    <DashboardShell
      userName={user.name}
      role="WORKER"
      navItems={WORKER_NAV}
      badges={pendingCount > 0 ? { "/worker/jobs": pendingCount } : {}}
    >
      {children}
    </DashboardShell>
  );
}
