import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { WORKER_NAV } from "@/lib/nav-items";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  return (
    <DashboardShell userName={user.name} navItems={WORKER_NAV}>
      {children}
    </DashboardShell>
  );
}
