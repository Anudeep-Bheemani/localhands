"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch("/api/notifications", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") throw e;
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { clearInterval(interval); controller.abort(); };
  }, []);

  // Position the portal dropdown relative to the button
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 99999,
      width: 320,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function markAllRead() {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  async function markOneRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-2xl border border-gray-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">Notifications</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-medium text-accent hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto rounded-b-2xl">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              onClick={() => { markOneRead(n.id); setOpen(false); }}
              className={`block border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50 ${!n.read ? "bg-blue-50" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-900">{n.title}</p>
                {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
              </div>
              {n.message && <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>}
              <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen((o) => !o)}
          className="relative rounded-full p-1.5 text-ink-muted transition hover:bg-canvas hover:text-ink"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-ink">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}
