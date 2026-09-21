import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/worker");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/customer" className="font-semibold text-neutral-900">
            LocalHands
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/customer" className="text-sm text-neutral-600 hover:text-neutral-900">
              Home
            </Link>
            <Link href="/customer/jobs" className="text-sm text-neutral-600 hover:text-neutral-900">
              My Jobs
            </Link>
            <Link href="/customer/custom-jobs" className="text-sm text-neutral-600 hover:text-neutral-900">
              Custom Jobs
            </Link>
            <Link href="/customer/passport" className="text-sm text-neutral-600 hover:text-neutral-900">
              Home Passport
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
