"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ menuRow = false, compact = false }: { menuRow?: boolean; compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (menuRow) {
    return (
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
      >
        <LogOut size={15} /> Log out
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={logout}
        aria-label="Log out"
        title="Log out"
        className="rounded-xl p-1.5 text-ink-muted transition hover:bg-danger-soft hover:text-danger"
      >
        <LogOut size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-danger hover:text-danger"
    >
      <LogOut size={13} /> Log out
    </button>
  );
}
