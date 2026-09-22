"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Settings, HelpCircle, ShieldCheck,
  Home, Compass, Briefcase, ListTodo, Heart, BookMarked,
  LayoutDashboard, CalendarClock, Star, UserCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { LogoutButton } from "@/components/logout-button";
import { BrandLogo } from "@/components/brand-logo";
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
  helpCircle: HelpCircle,
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
    <div className="min-h-screen bg-canvas lg:block">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="rounded-xl p-1.5 text-ink-muted hover:bg-surface-subtle">
          <Menu size={20} />
        </button>
        <BrandLogo compact />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <LogoutButton compact />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 shrink-0 flex-col bg-ink text-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-7 py-7">
          <BrandLogo dark />
          <button onClick={() => setMobileOpen(false)} className="text-white/50 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="px-7">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
            {role === "WORKER" ? "Pro suite" : "Customer"}
          </span>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-2">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
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
                className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-accent to-accent-dark text-white shadow-[0_8px_20px_-6px_rgba(226,83,12,0.6)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      active ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/50 group-hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  {item.label}
                </span>
                {!!badge && (
                  <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-white">{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {role === "WORKER" && (
          <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-accent">
              <ShieldCheck size={16} />
              Independent business
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-white/50">
              You&apos;re not an employee — you run your own service business through LocalHands.
            </p>
          </div>
        )}

        <div className="border-t border-white/10 p-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark font-display text-base text-white">
                  {userName.charAt(0)}
                </span>
                <span className="truncate font-semibold">{userName}</span>
              </span>
              <ChevronDown size={16} className="shrink-0 text-white/40" />
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
      <div className="relative min-h-screen lg:ml-80">
        <div className="hidden items-center justify-between border-b border-border bg-white/90 px-10 py-4 backdrop-blur-xl lg:flex">
          <Link
            href="/"
            className="group flex items-center gap-2 text-base font-bold text-ink-muted transition hover:text-ink"
          >
            <Home size={17} />
            <span className="relative">
              Home
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-10 py-12">{children}</main>
        <footer className="border-t border-border px-10 py-7">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
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
