import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/worker" className="font-semibold text-neutral-900">
            LocalHands
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/worker" className="text-sm text-neutral-600 hover:text-neutral-900">
              Dashboard
            </Link>
            <Link href="/worker/jobs" className="text-sm text-neutral-600 hover:text-neutral-900">
              Jobs
            </Link>
            <Link href="/worker/custom-jobs" className="text-sm text-neutral-600 hover:text-neutral-900">
              Custom Jobs Board
            </Link>
            <Link href="/worker/profile" className="text-sm text-neutral-600 hover:text-neutral-900">
              My Profile
            </Link>
            <span className="text-sm text-neutral-400">{user.name}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
