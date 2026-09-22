import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { CUSTOMER_NAV, WORKER_NAV } from "@/lib/nav-items";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { PageHeader } from "@/components/page-header";

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const addresses =
    user.role === "CUSTOMER"
      ? await prisma.savedAddress.findMany({ where: { customerId: user.id }, orderBy: { createdAt: "desc" } })
      : [];

  return (
    <DashboardShell userName={user.name} role={user.role} navItems={user.role === "CUSTOMER" ? CUSTOMER_NAV : WORKER_NAV}>
      <div className="mx-auto max-w-2xl">
        <PageHeader eyebrow="⚙️ Account" title="Account settings" description="Manage your login details and account info." contained />
        <div className="mt-6">
          <AccountSettingsForm
            user={{ name: user.name, phone: user.phone, email: user.email, role: user.role }}
            addresses={addresses}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
