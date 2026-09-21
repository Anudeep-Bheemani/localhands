import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, MapPin, MessageCircle, ShieldCheck, Star, Wrench, Hammer, ChefHat, Sparkles, Dog, Truck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/reveal";

const CATEGORIES = [
  { label: "Electrical", icon: Wrench },
  { label: "Plumbing", icon: Hammer },
  { label: "Cooking", icon: ChefHat },
  { label: "Cleaning", icon: Sparkles },
  { label: "Pet care", icon: Dog },
  { label: "Moving", icon: Truck },
];

const STEPS = [
  { title: "Describe", body: "Type, snap a photo, or leave a voice note about what you need." },
  { title: "Discover", body: "See nearby workers with distance, rating, price, and why they match." },
  { title: "Choose", body: "Pick who does the job — not an anonymous dispatch algorithm." },
  { title: "Track & pay", body: "Watch them arrive, approve any changes, pay, and review." },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "WORKER" ? "/worker" : "/customer");

  return (
    <div className="flex flex-1 flex-col">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-xl italic tracking-tight text-ink">LocalHands</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas transition hover:bg-accent"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-20 pb-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-ink-muted">
                Local work, connected.
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
                Find the right person for any local job.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg text-ink-muted">
                From fixing a switchboard to moving a cupboard — one trusted place to
                find, choose, talk to, track, pay, and remember every independent
                local worker.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-ink shadow-[0_8px_24px_-8px_rgba(193,80,45,0.55)] transition hover:brightness-110"
                >
                  I need a service
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-border bg-surface px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  I&apos;m a worker
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-16 flex flex-wrap gap-3">
                {CATEGORIES.map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink-muted"
                  >
                    <Icon size={15} className="text-accent" />
                    {label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-ink-muted">
                  + custom jobs
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Product preview card */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="grid gap-6 rounded-3xl border border-border bg-surface p-8 shadow-[0_1px_0_rgba(0,0,0,0.03)] md:grid-cols-[1.1fr_1fr] md:p-10">
                <div>
                  <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-ink-muted">
                    <Search size={16} />
                    <span>&ldquo;My electrical switchboard is damaged&rdquo;</span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-medium text-ink">Ramesh Kumar</p>
                        <p className="text-sm text-ink-muted">Electrician · 8 yrs experience</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
                        <Star size={14} fill="currentColor" />
                        4.9
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                      <span className="rounded-full bg-canvas px-3 py-1">Required skill ✓</span>
                      <span className="rounded-full bg-canvas px-3 py-1">0.8 km away ✓</span>
                      <span className="rounded-full bg-canvas px-3 py-1">Available now ✓</span>
                      <span className="rounded-full bg-canvas px-3 py-1">Material available ✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 shrink-0 text-accent" size={18} />
                    <p className="text-sm text-ink-muted">
                      Live status while Ramesh travels — Booked → Travelling → Arrived → Working → Completed.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 shrink-0 text-accent" size={18} />
                    <p className="text-sm text-ink-muted">
                      Chat and call tied to the job — no generic inbox.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 shrink-0 text-accent" size={18} />
                    <p className="text-sm text-ink-muted">
                      Every extra cost needs your approval before it&apos;s added to the bill.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 pb-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight text-ink">How it works</h2>
            </Reveal>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div>
                    <span className="font-display text-4xl text-accent-soft" style={{ WebkitTextStroke: "1.5px var(--accent)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-ink-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink-muted sm:flex-row">
          <span className="font-display italic text-ink">LocalHands</span>
          <span>Your skills. Your services. Your customers. Your business.</span>
        </div>
      </footer>
    </div>
  );
}
