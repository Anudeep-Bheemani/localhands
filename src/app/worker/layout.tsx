import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/worker" className="font-display italic text-lg text-ink">
            LocalHands
          </Link>
          <nav className="flex items-center gap-7">
            <Link href="/worker" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Dashboard
            </Link>
            <Link href="/worker/jobs" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Jobs
            </Link>
            <Link href="/worker/custom-jobs" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              Custom Jobs Board
            </Link>
            <Link href="/worker/profile" className="text-sm font-medium text-ink-muted transition hover:text-ink">
              My Profile
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
