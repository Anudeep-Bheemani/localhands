"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Trash2, MapPin } from "lucide-react";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[180px] rounded-2xl border border-border bg-canvas" /> }
);

type Address = { id: string; label: string; address: string; lat: number; lng: number };

export function AccountSettingsForm({
  user,
  addresses,
}: {
  user: { name: string; phone: string; email: string; role: "CUSTOMER" | "WORKER" };
  addresses: Address[];
}) {
  return (
    <div className="mt-8 flex flex-col gap-10">
      <BasicInfo user={user} />
      <PasswordSection />
      {user.role === "CUSTOMER" && <AddressesSection initial={addresses} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BasicInfo({ user }: { user: { name: string; phone: string; email: string } }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="Basic info">
      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Email</span>
          <input value={user.email} disabled className="input mt-1.5 opacity-60" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Phone number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1.5" />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="Change password">
      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">New password</span>
          <input
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input mt-1.5"
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        {success && <p className="text-sm text-accent">Password updated.</p>}
        <button
          type="submit"
          disabled={loading || !currentPassword || newPassword.length < 6}
          className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </Section>
  );
}

function AddressesSection({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, address, lat, lng }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [data.address, ...prev]);
        setAdding(false);
        setAddress("");
        setLabel("Home");
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
  }

  return (
    <Section title="Saved addresses">
      <div className="flex flex-col gap-2">
        {addresses.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-ink">{a.label}</p>
                <p className="text-xs text-ink-muted">{a.address}</p>
              </div>
            </div>
            <button onClick={() => remove(a.id)} className="text-ink-muted hover:text-accent">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={save} className="mt-4 rounded-xl border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Label</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} className="input mt-1" placeholder="Home / Work" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Address</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mt-1" />
            </label>
          </div>
          <div className="mt-3">
            <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={loading} className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:bg-accent disabled:opacity-50">
              {loading ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink-muted hover:border-ink">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 rounded-full border border-dashed border-border px-4 py-2 text-sm text-ink-muted hover:border-ink hover:text-ink"
        >
          + Add address
        </button>
      )}
    </Section>
  );
}
