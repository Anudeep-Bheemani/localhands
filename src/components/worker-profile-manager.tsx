"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Product = { id: string; name: string; price: number; inStock: boolean };
type Service = { id: string; price: number; service: { name: string; category: { name: string } } };

type Profile = {
  bio: string;
  experienceYears: number;
  baseAddress: string;
  serviceRadiusKm: number;
  availableNow: boolean;
  acceptsCustomJobs: boolean;
  services: Service[];
  products: Product[];
  portfolio: { id: string; photoUrl: string }[];
};

export function WorkerProfileManager({ profile }: { profile: Profile }) {
  const [availableNow, setAvailableNow] = useState(profile.availableNow);
  const [acceptsCustomJobs, setAcceptsCustomJobs] = useState(profile.acceptsCustomJobs);
  const [products, setProducts] = useState(profile.products);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);

  async function toggleField(field: "availableNow" | "acceptsCustomJobs", value: boolean) {
    if (field === "availableNow") setAvailableNow(value);
    else setAcceptsCustomJobs(value);
    await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    setAdding(true);
    try {
      const res = await fetch("/api/worker/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, price: Number(newPrice) }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => [...prev, data.product]);
        setNewName("");
        setNewPrice("");
      }
    } finally {
      setAdding(false);
    }
  }

  async function toggleStock(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, inStock: !p.inStock } : p)));
    await fetch(`/api/worker/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !product.inStock }),
    });
  }

  async function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/worker/products/${id}`, { method: "DELETE" });
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      <Section title="Availability">
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Available now"
            description="Shown to customers filtering for immediate availability"
            checked={availableNow}
            onChange={(v) => toggleField("availableNow", v)}
          />
          <ToggleRow
            label="Open to custom jobs"
            description="Appear on the custom jobs board for one-off tasks"
            checked={acceptsCustomJobs}
            onChange={(v) => toggleField("acceptsCustomJobs", v)}
          />
        </div>
      </Section>

      <Section title="Services & pricing">
        <div className="grid gap-2 sm:grid-cols-2">
          {profile.services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
              <div>
                <p className="text-sm text-ink">{s.service.name}</p>
                <p className="text-xs text-ink-muted">{s.service.category.name}</p>
              </div>
              <span className="text-sm font-medium text-ink">₹{s.price.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Products & materials">
        <p className="text-xs text-ink-muted">
          Customers see what you have on hand before booking, so a job never gets stuck for missing material.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
              <div>
                <p className={`text-sm ${p.inStock ? "text-ink" : "text-ink-muted line-through"}`}>{p.name}</p>
                <p className="text-xs text-ink-muted">₹{p.price.toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleStock(p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.inStock ? "bg-accent-soft text-accent" : "bg-canvas text-ink-muted"
                  }`}
                >
                  {p.inStock ? "In stock" : "Out of stock"}
                </button>
                <button type="button" onClick={() => removeProduct(p.id)} className="text-ink-muted hover:text-accent">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addProduct} className="mt-4 flex items-end gap-2">
          <label className="flex-1">
            <span className="text-xs font-medium text-ink-muted">Item name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input mt-1" placeholder="E.g. Modular switch" />
          </label>
          <label className="w-28">
            <span className="text-xs font-medium text-ink-muted">Price ₹</span>
            <input
              type="number"
              min={0}
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="input mt-1"
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
          >
            <Plus size={14} /> Add
          </button>
        </form>
      </Section>

      {profile.portfolio.length > 0 && (
        <Section title="Portfolio">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {profile.portfolio.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.photoUrl} alt="" className="aspect-square rounded-xl object-cover" />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div>
        <p className="text-sm text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-border"}`}
      >
        <span
          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
