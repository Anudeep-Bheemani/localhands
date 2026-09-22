"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Minus, Locate, Save, Loader2, ImagePlus, Sparkles, X, BadgeCheck, ArrowRight } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-[220px] rounded-2xl border border-border bg-canvas" /> }
);

type Product = { id: string; name: string; price: number; stockQty: number; inStock: boolean; photoUrl: string | null };
type WorkerServiceItem = { id: string; serviceId: string; price: number; service: { name: string; category: { name: string } } };
type PortfolioItem = { id: string; photoUrl: string; caption: string };
type Service = { id: string; name: string; indicativePrice: number };
type Category = { id: string; name: string; icon: string; services: Service[] };

export type WorkingHoursDay = { day: number; enabled: boolean; start: string; end: string };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEFAULT_WORKING_HOURS: WorkingHoursDay[] = DAY_NAMES.map((_, day) => ({
  day,
  enabled: day !== 0,
  start: "09:00",
  end: "18:00",
}));

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
  workingHours: WorkingHoursDay[] | null;
  services: WorkerServiceItem[];
  products: Product[];
  portfolio: PortfolioItem[];
  customSkills: string[];
};

export function WorkerProfileManager({ profile, categories }: { profile: Profile; categories: Category[] }) {
  return (
    <div className="mt-8 flex flex-col gap-10">
      <BasicInfoSection profile={profile} />
      <AvailabilitySection profile={profile} />
      <VerificationSection />
      <WorkingHoursSection initial={profile.workingHours} />
      <SkillsSection initialServices={profile.services} categories={categories} />
      <CustomSkillsSection initialSkills={profile.customSkills} />
      <ProductsSection initialProducts={profile.products} />
      <PortfolioSection initialPortfolio={profile.portfolio} />
    </div>
  );
}

function VerificationSection() {
  const [applied, setApplied] = useState(false);

  return (
    <Section title="Profile verification" hint="Build trust with customers by showing that your identity has been reviewed.">
      <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-surface p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_8px_20px_-8px_rgba(226,83,12,0.8)]">
              <BadgeCheck size={25} />
            </span>
            <div>
              <h3 className="font-display text-xl text-ink">Get your verified badge</h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-ink-muted">
                A verified badge helps customers feel confident when choosing your services.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                <span className="rounded-full bg-white/70 px-3 py-1">Identity check</span>
                <span className="rounded-full bg-white/70 px-3 py-1">Trust badge</span>
                <span className="rounded-full bg-white/70 px-3 py-1">More confidence</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApplied(true)}
            disabled={applied}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              applied ? "bg-white text-accent-dark" : "bg-ink text-white hover:bg-accent"
            }`}
          >
            {applied ? <><BadgeCheck size={16} /> Application noted</> : <>Apply for verification <ArrowRight size={16} /></>}
          </button>
        </div>
        {applied && (
          <p className="relative mt-4 border-t border-accent/15 pt-4 text-xs font-medium text-accent-dark">
            Your request is ready for review. This demo keeps the application on this page only.
          </p>
        )}
      </div>
    </Section>
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

function WorkingHoursSection({ initial }: { initial: WorkingHoursDay[] | null }) {
  const [hours, setHours] = useState<WorkingHoursDay[]>(initial ?? DEFAULT_WORKING_HOURS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(day: number, patch: Partial<WorkingHoursDay>) {
    setHours((prev) => prev.map((d) => (d.day === day ? { ...d, ...patch } : d)));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingHours: hours }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Working hours" hint="When you're typically available — shown on your public profile.">
      <div className="flex flex-col gap-2">
        {hours.map((d) => (
          <div key={d.day} className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5">
            <button
              type="button"
              onClick={() => update(d.day, { enabled: !d.enabled })}
              className={`h-5 w-9 shrink-0 rounded-full transition ${d.enabled ? "bg-accent" : "bg-border"}`}
            >
              <span className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition ${d.enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
            <span className={`w-24 text-sm ${d.enabled ? "text-ink" : "text-ink-muted"}`}>{DAY_NAMES[d.day]}</span>
            {d.enabled ? (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="time"
                  value={d.start}
                  onChange={(e) => update(d.day, { start: e.target.value })}
                  className="rounded-md border border-border bg-surface px-2 py-1"
                />
                <span>to</span>
                <input
                  type="time"
                  value={d.end}
                  onChange={(e) => update(d.day, { end: e.target.value })}
                  className="rounded-md border border-border bg-surface px-2 py-1"
                />
              </div>
            ) : (
              <span className="text-sm text-ink-muted">Closed</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-50"
      >
        <Save size={14} /> {saving ? "Saving…" : saved ? "Saved" : "Save hours"}
      </button>
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

function CustomSkillsSection({ initialSkills }: { initialSkills: string[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function persist(next: string[]) {
    setSaving(true);
    try {
      await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customSkills: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    const next = [...skills, value];
    setSkills(next);
    setDraft("");
    persist(next);
  }

  function removeSkill(value: string) {
    const next = skills.filter((s) => s !== value);
    setSkills(next);
    persist(next);
  }

  return (
    <Section
      title="Custom skills"
      hint="Not on our list? Add it yourself — e.g. 'dog grooming', 'aquarium cleaning', 'furniture assembly'. Customers searching those exact words will find you."
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Type a skill and press Enter"
          className="input w-56 sm:w-64"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={!draft.trim()}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-dark disabled:opacity-40"
        >
          <Plus size={14} /> Add
        </button>
        {saving && <Loader2 size={14} className="animate-spin text-ink-muted" />}
      </div>

      {skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-accent to-accent-dark py-1.5 pl-3.5 pr-2 text-sm font-medium text-white shadow-[var(--shadow-fine)]"
            >
              <Sparkles size={12} className="text-white/80" />
              {s}
              <button
                type="button"
                onClick={() => removeSkill(s)}
                aria-label={`Remove ${s}`}
                className="ml-0.5 rounded-full p-0.5 transition hover:bg-white/20"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">No custom skills added yet.</p>
      )}
    </Section>
  );
}

function ProductPhoto({ photoUrl, onChange }: { photoUrl: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-canvas text-ink-muted"
    >
      {uploading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImagePlus size={14} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </button>
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

  async function setPrice(id: string, price: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));
    await fetch(`/api/worker/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
  }

  async function setPhoto(id: string, photoUrl: string | null) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, photoUrl } : p)));
    await fetch(`/api/worker/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
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
            <div className="flex items-center gap-3">
              <ProductPhoto photoUrl={p.photoUrl} onChange={(url) => setPhoto(p.id, url)} />
              <div>
                <p className={`text-sm ${p.stockQty > 0 ? "text-ink" : "text-ink-muted line-through"}`}>{p.name}</p>
                <div className="flex items-center gap-1 text-xs text-ink-muted">
                  ₹
                  <input
                    type="number"
                    min={0}
                    defaultValue={p.price}
                    onBlur={(e) => setPrice(p.id, Number(e.target.value))}
                    className="w-14 rounded border border-transparent bg-transparent px-1 hover:border-border focus:border-border focus:outline-none"
                  />
                  each
                </div>
              </div>
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
