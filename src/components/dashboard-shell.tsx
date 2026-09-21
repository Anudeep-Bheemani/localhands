"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, ChevronDown, Settings, LogOut, HelpCircle, ShieldCheck,
  Home, Compass, Briefcase, ListTodo, Heart, BookMarked,
  LayoutDashboard, CalendarClock, Star, UserCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import type { LucideIcon } from "lucide-react";
import type { NavItem, NavIconName } from "@/lib/nav-items";

const ICON_MAP: Record<NavIconName, LucideIcon> = {
  home: Home,
  compass: Compass,
  briefcase: Briefcase,
  listTodo: ListTodo,
  heart: Heart,
  bookMarked: BookMarked,
  layoutDashboard: LayoutDashboard,
  calendarClock: CalendarClock,
  star: Star,
  userCircle: UserCircle,
};

export function DashboardShell({
  userName,
  role,
  navItems,
  badges = {},
  children,
}: {
  userName: string;
  role: "CUSTOMER" | "WORKER";
  navItems: NavItem[];
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/customer" || href === "/worker") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="rounded-xl p-1.5 text-ink-muted hover:bg-surface-subtle">
          <Menu size={20} />
        </button>
        <span className="font-display italic text-lg text-ink">LocalHands</span>
        <NotificationBell />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="font-display italic text-xl text-ink">
            LocalHands
          </Link>
          <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-canvas">
            {role === "WORKER" ? "Pro Suite" : "Customer"}
          </span>
          <button onClick={() => setMobileOpen(false)} className="text-ink-muted lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70">
            {role === "WORKER" ? "Business" : "Menu"}
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = ICON_MAP[item.icon];
            const badge = badges[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-accent-soft text-accent-dark" : "text-ink-muted hover:bg-surface-subtle hover:text-ink"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`icon-chip h-7 w-7 ${active ? "bg-accent text-accent-ink" : "bg-surface-subtle text-ink-muted"}`}>
                    <Icon size={15} />
                  </span>
                  {item.label}
                </span>
                {!!badge && (
                  <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {role === "WORKER" && (
          <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-accent-dark to-accent p-3.5 text-white">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <ShieldCheck size={15} />
              Independent business
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/80">
              You&apos;re not an employee — you run your own service business through LocalHands.
            </p>
          </div>
        )}

        <div className="border-t border-border p-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-ink hover:bg-surface-subtle"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft font-display text-sm text-accent-dark">
                  {userName.charAt(0)}
                </span>
                <span className="truncate font-semibold">{userName}</span>
              </span>
              <ChevronDown size={15} className="shrink-0 text-ink-muted" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                <Link
                  href="/account/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-subtle"
                >
                  <Settings size={15} /> Account settings
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-subtle"
                >
                  <HelpCircle size={15} /> Help & support
                </Link>
                <LogoutMenuItem />
              </div>
            )}
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="hidden items-center justify-end border-b border-border bg-surface/80 px-8 py-4 backdrop-blur lg:flex">
          <NotificationBell />
        </div>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-border px-6 py-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
            <span>&copy; {new Date().getFullYear()} LocalHands</span>
            <div className="flex gap-4">
              <Link href="/help" className="hover:text-ink">Help</Link>
              <Link href="/help#terms" className="hover:text-ink">Terms</Link>
              <Link href="/help#contact" className="hover:text-ink">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LogoutMenuItem() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
    >
      <LogOut size={15} /> Log out
    </button>
  );
}
