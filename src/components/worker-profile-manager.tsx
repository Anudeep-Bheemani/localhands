"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Minus, Locate, Save } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[220px] rounded-2xl border border-border bg-canvas" /> }
);

type Product = { id: string; name: string; price: number; stockQty: number; inStock: boolean };
type WorkerServiceItem = { id: string; serviceId: string; price: number; service: { name: string; category: { name: string } } };
type PortfolioItem = { id: string; photoUrl: string; caption: string };
type Service = { id: string; name: string; indicativePrice: number };
type Category = { id: string; name: string; icon: string; services: Service[] };

type Profile = {
  bio: string;
  experienceYears: number;
  baseAddress: string;
  baseLat: number;
  baseLng: number;
  serviceRadiusKm: number;
  availableNow: boolean;
  acceptsCustomJobs: boolean;
  profilePhotoUrl: string | null;
  services: WorkerServiceItem[];
  products: Product[];
  portfolio: PortfolioItem[];
};

export function WorkerProfileManager({ profile, categories }: { profile: Profile; categories: Category[] }) {
  return (
    <div className="mt-8 flex flex-col gap-10">
      <BasicInfoSection profile={profile} />
      <AvailabilitySection profile={profile} />
      <SkillsSection initialServices={profile.services} categories={categories} />
      <ProductsSection initialProducts={profile.products} />
      <PortfolioSection initialPortfolio={profile.portfolio} />
    </div>
  );
}

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BasicInfoSection({ profile }: { profile: Profile }) {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profilePhotoUrl);
  const [bio, setBio] = useState(profile.bio);
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);
  const [baseAddress, setBaseAddress] = useState(profile.baseAddress);
  const [lat, setLat] = useState(profile.baseLat);
  const [lng, setLng] = useState(profile.baseLng);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(profile.serviceRadiusKm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhotoUrl, bio, experienceYears, baseAddress, baseLat: lat, baseLng: lng, serviceRadiusKm }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Basic info">
      <div className="flex flex-col gap-4">
        <SinglePhotoUpload folder="profile-photos" value={profilePhotoUrl} onChange={setProfilePhotoUrl} label="Profile photo" />
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input mt-1.5 resize-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Experience (yrs)</span>
            <input
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="input mt-1.5"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Address / area</span>
          <input value={baseAddress} onChange={(e) => setBaseAddress(e.target.value)} className="input mt-1.5" />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-muted">Base location</span>
          <button type="button" onClick={useMyLocation} className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
            <Locate size={13} /> Use my current location
          </button>
        </div>
        <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">
            Service radius: <span className="text-ink">{serviceRadiusKm} km</span>
          </span>
          <input
            type="range"
            min={1}
            max={30}
            value={serviceRadiusKm}
            onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
        >
          <Save size={14} /> {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </Section>
  );
}

function AvailabilitySection({ profile }: { profile: Profile }) {
  const [availableNow, setAvailableNow] = useState(profile.availableNow);
  const [acceptsCustomJobs, setAcceptsCustomJobs] = useState(profile.acceptsCustomJobs);

  async function toggleField(field: "availableNow" | "acceptsCustomJobs", value: boolean) {
    if (field === "availableNow") setAvailableNow(value);
    else setAcceptsCustomJobs(value);
    await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  return (
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
  );
}

function SkillsSection({ initialServices, categories }: { initialServices: WorkerServiceItem[]; categories: Category[] }) {
  const [services, setServices] = useState(initialServices);
  const [addingFor, setAddingFor] = useState<Service | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const offeredIds = useMemo(() => new Set(services.map((s) => s.serviceId)), [services]);

  async function addService() {
    if (!addingFor || !newPrice) return;
    const res = await fetch("/api/worker/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: addingFor.id, price: Number(newPrice) }),
    });
    const data = await res.json();
    if (res.ok) {
      setServices((prev) => [...prev, data.service]);
      setAddingFor(null);
      setNewPrice("");
    }
  }

  async function updatePrice(id: string, price: number) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price } : s)));
    await fetch(`/api/worker/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
  }

  async function removeService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/worker/services/${id}`, { method: "DELETE" });
  }

  return (
    <Section title="Skills & services" hint="Add any skill you're capable of — across categories, not just your main trade.">
      <div className="flex flex-col gap-6">
        {categories.map((cat) => {
          const inCategory = services.filter((s) => cat.services.some((cs) => cs.id === s.serviceId));
          const available = cat.services.filter((cs) => !offeredIds.has(cs.id));
          if (inCategory.length === 0 && available.length === 0) return null;

          return (
            <div key={cat.id}>
              <p className="text-sm font-medium text-ink">{cat.name}</p>
              <div className="mt-2 flex flex-col gap-2">
                {inCategory.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
                    <span className="text-sm text-ink">{s.service.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-ink-muted">₹</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={s.price}
                          onBlur={(e) => updatePrice(s.id, Number(e.target.value))}
                          className="w-16 rounded-md border border-border bg-surface px-1.5 py-1 text-right"
                        />
                      </div>
                      <button onClick={() => removeService(s.id)} className="text-ink-muted hover:text-accent">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {available.map((s) =>
                  addingFor?.id === s.id ? (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-ink px-4 py-2.5">
                      <span className="text-sm text-ink">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          autoFocus
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="Price ₹"
                          className="w-20 rounded-md border border-border bg-surface px-1.5 py-1 text-right text-sm"
                        />
                        <button onClick={addService} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={s.id}
                      onClick={() => { setAddingFor(s); setNewPrice(String(s.indicativePrice)); }}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2.5 text-left text-sm text-ink-muted hover:border-ink hover:text-ink"
                    >
                      <Plus size={13} /> {s.name}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ProductsSection({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [adding, setAdding] = useState(false);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    setAdding(true);
    try {
      const res = await fetch("/api/worker/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, price: Number(newPrice), stockQty: Number(newQty) || 0 }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => [...prev, data.product]);
        setNewName("");
        setNewPrice("");
        setNewQty("1");
      }
    } finally {
      setAdding(false);
    }
  }

  async function setQty(product: Product, qty: number) {
    const clamped = Math.max(0, qty);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stockQty: clamped, inStock: clamped > 0 } : p)));
    await fetch(`/api/worker/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQty: clamped }),
    });
  }

  async function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/worker/products/${id}`, { method: "DELETE" });
  }

  return (
    <Section title="Inventory" hint="How many of each material you have on hand — customers see this before booking.">
      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
            <div>
              <p className={`text-sm ${p.stockQty > 0 ? "text-ink" : "text-ink-muted line-through"}`}>{p.name}</p>
              <p className="text-xs text-ink-muted">₹{p.price.toFixed(0)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(p, p.stockQty - 1)} className="rounded-full border border-border p-1.5 text-ink-muted hover:border-ink hover:text-ink">
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm text-ink">{p.stockQty}</span>
                <button onClick={() => setQty(p, p.stockQty + 1)} className="rounded-full border border-border p-1.5 text-ink-muted hover:border-ink hover:text-ink">
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={() => removeProduct(p.id)} className="text-ink-muted hover:text-accent">
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
        <label className="w-24">
          <span className="text-xs font-medium text-ink-muted">Price ₹</span>
          <input type="number" min={0} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="input mt-1" />
        </label>
        <label className="w-20">
          <span className="text-xs font-medium text-ink-muted">Qty</span>
          <input type="number" min={0} value={newQty} onChange={(e) => setNewQty(e.target.value)} className="input mt-1" />
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
  );
}

function PortfolioSection({ initialPortfolio }: { initialPortfolio: PortfolioItem[] }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  async function addPhoto(url: string | null) {
    if (!url) return;
    const res = await fetch("/api/worker/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: url }),
    });
    const data = await res.json();
    if (res.ok) setPortfolio((prev) => [data.item, ...prev]);
  }

  async function removePhoto(id: string) {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/worker/portfolio/${id}`, { method: "DELETE" });
  }

  return (
    <Section title="Portfolio">
      <div className="flex flex-wrap gap-3">
        {portfolio.map((p) => (
          <div key={p.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => removePhoto(p.id)}
              className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-canvas opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <SinglePhotoUpload folder="portfolio" value={null} onChange={addPhoto} label="" />
      </div>
    </Section>
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
