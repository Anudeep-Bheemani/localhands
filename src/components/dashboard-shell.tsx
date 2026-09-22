"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Settings, HelpCircle, ShieldCheck, Sparkles,
  Home, Compass, Briefcase, ListTodo, Heart, BookMarked,
  LayoutDashboard, CalendarClock, Star, UserCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { LogoutButton } from "@/components/logout-button";
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
        <Link href="/" className="font-display text-lg tracking-tight text-ink">
          LocalHands
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <LogoutButton compact />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col bg-ink text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-tight text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark text-white">
              <Sparkles size={14} />
            </span>
            LocalHands
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-white/50 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="px-6">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
            {role === "WORKER" ? "Pro suite" : "Customer"}
          </span>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
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
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-accent to-accent-dark text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.6)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      active ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/50 group-hover:text-white"
                    }`}
                  >
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
          <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
              <ShieldCheck size={15} />
              Independent business
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/50">
              You&apos;re not an employee — you run your own service business through LocalHands.
            </p>
          </div>
        )}

        <div className="border-t border-white/10 p-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-white hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark font-display text-sm text-white">
                  {userName.charAt(0)}
                </span>
                <span className="truncate font-semibold">{userName}</span>
              </span>
              <ChevronDown size={15} className="shrink-0 text-white/40" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border border-border bg-surface p-1.5 shadow-xl">
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
                <LogoutButton menuRow />
              </div>
            )}
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="relative flex min-h-screen flex-1 flex-col">
        <div className="hidden items-center justify-between border-b border-border bg-surface/80 px-8 py-4 backdrop-blur lg:flex">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
          >
            <Home size={15} />
            <span className="relative">
              Home
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>
        <main className="relative mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
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
