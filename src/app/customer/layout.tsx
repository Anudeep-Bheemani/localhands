import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { CUSTOMER_NAV } from "@/lib/nav-items";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/worker");

  return (
    <DashboardShell userName={user.name} navItems={CUSTOMER_NAV}>
      {children}
    </DashboardShell>
  );
}
