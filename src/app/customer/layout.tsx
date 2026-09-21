import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/worker");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/customer" className="font-display italic text-lg text-ink">
            LocalHands
          </Link>
          <nav className="flex items-center gap-7">
            <Link href="/customer" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Home
            </Link>
            <Link href="/customer/jobs" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              My Jobs
            </Link>
            <Link href="/customer/custom-jobs" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Custom Jobs
            </Link>
            <Link href="/customer/passport" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Home Passport
            </Link>
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <span className="text-sm text-ink-muted">{user.name}</span>
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
