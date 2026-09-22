import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Search, MapPin, MessageCircle, ShieldCheck, Star, Wrench, Hammer, ChefHat,
  Sparkles, Dog, Truck, Camera, Mic, Clock, IndianRupee, ArrowRight, ArrowDown,
  Award, TrendingUp, Users, ClipboardList, BadgeCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Reveal } from "@/components/reveal";
import { SiteNav } from "@/components/site-nav";
import { HeroVisual } from "@/components/hero-visual";
import { CinematicHero } from "@/components/cinematic-hero";
import { AnimatedCounter } from "@/components/animated-counter";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { TiltCard } from "@/components/tilt-card";
import { FloatingCTA } from "@/components/floating-cta";
import { MarqueeStrip } from "@/components/marquee-strip";

const CATEGORIES = [
  { label: "Electrical", icon: Wrench, big: true, img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop" },
  { label: "Plumbing", icon: Hammer, big: false, img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop" },
  { label: "Cooking", icon: ChefHat, big: false, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop" },
  { label: "Cleaning", icon: Sparkles, big: true, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop" },
  { label: "Pet care", icon: Dog, big: false, img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop" },
  { label: "Moving", icon: Truck, big: false, img: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=400&fit=crop" },
];

const CUSTOMER_STEPS = [
  { title: "Describe it", body: "Type, snap a photo, or leave a voice note about what you need done." },
  { title: "Find someone", body: "See nearby workers with distance, rating, price — and why they match." },
  { title: "Get it done", body: "Pick who does the job, chat, track them arrive, and approve any changes." },
  { title: "Review the work", body: "Pay when you're satisfied and leave a review tied to the real job." },
];

const WORKER_STEPS = [
  "Build your profile",
  "Show your skills",
  "Get local jobs",
  "Complete work",
  "Build your reputation",
  "Earn",
];

const TRUST_MECHANISMS = [
  { label: "Verified reviews", body: "Every review is tied to a completed job — no anonymous ratings.", icon: Star },
  { label: "Job history", body: "See exactly how many jobs a worker has finished, and how recently.", icon: ClipboardList },
  { label: "Before/after photos", body: "Workers document the work with evidence photos at completion.", icon: Camera },
  { label: "Live location", body: "Track distance and travel status while a worker is on the way.", icon: MapPin },
  { label: "Approved pricing", body: "Extra costs need your sign-off before they're added to the bill.", icon: ShieldCheck },
  { label: "Real availability", body: "Workers set their own hours — you only see who's actually free.", icon: Clock },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "WORKER" ? "/worker" : "/customer");

  const [workerCount, categoryCount, jobsCompleted, reviewCount] = await Promise.all([
    prisma.workerProfile.count({ where: { profileComplete: true } }),
    prisma.category.count(),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.review.count(),
  ]);

  const stats = [
    { label: "Independent workers", value: workerCount },
    { label: "Service categories", value: categoryCount },
    { label: "Jobs completed", value: jobsCompleted },
    { label: "Reviews from real jobs", value: reviewCount },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <SiteNav />

      <main className="flex-1">
        <CinematicHero />

        {/* category quick-links, right under hero */}
        <section className="px-6 pt-10">
          <Reveal className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2.5">
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted"
              >
                <Icon size={13} className="text-accent" />
                {label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3.5 py-1.5 text-xs text-ink-muted">
              + anything else
            </span>
          </Reveal>
        </section>

        <MarqueeStrip
          className="mt-16"
          items={["ELECTRICAL", "PLUMBING", "COOKING", "CLEANING", "PET CARE", "MOVING", "AND ANYTHING ELSE"]}
        />

        {/* ───────────────────── STATS ───────────────────── */}
        <section className="border-y border-border bg-surface px-6 py-12">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="text-center sm:text-left">
                  <p className="font-display text-4xl text-ink sm:text-5xl">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-ink-muted sm:text-sm">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────────── THE PROBLEM ───────────────────── */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h2 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
                Something needs fixing. Someone needs help.
                <br />
                <span className="text-ink-muted">Finding the right person shouldn&apos;t be the hard part.</span>
              </h2>
            </Reveal>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORIES.map(({ label, icon: Icon, img }, i) => (
              <Reveal key={label} delay={i * 0.05}>
                <TiltCard>
                  <Link
                    href="/signup"
                    className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={label}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between p-4">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur">
                        <Icon size={16} />
                      </span>
                      <ArrowRight
                        size={16}
                        className="translate-x-1 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </div>
                    <span className="relative z-10 p-4 pt-0 font-display text-lg text-white">{label}</span>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────────── CREATE ANY JOB (dark) ───────────────────── */}
        <section className="bg-ink px-6 py-28 text-canvas">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                If it&apos;s a job,
                <br />
                you can ask for it.
              </h2>
              <p className="mt-5 max-w-md text-white/60">
                No matching category? Post a custom job — nearby workers with
                related skills can pick it up directly.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <TiltCard>
                <div className="mt-14 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/80">
                    &ldquo;I need someone to move a large cupboard from my second
                    floor to the garage.&rdquo;
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {[
                      { icon: Camera, label: "Photos" },
                      { icon: Mic, label: "Voice message" },
                      { icon: MapPin, label: "Location" },
                      { icon: Clock, label: "Preferred time" },
                      { icon: IndianRupee, label: "Budget" },
                    ].map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs text-white/70"
                      >
                        <Icon size={12} />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="my-6 flex items-center gap-3 text-white/30">
                    <div className="h-px flex-1 bg-white/10" />
                    <ArrowDown size={16} />
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-canvas p-5 text-ink sm:flex-row sm:items-center">
                    <div>
                      <span className="badge bg-accent-soft text-accent-dark">Custom job</span>
                      <p className="mt-2 font-display text-base">Move a cupboard — 2nd floor to garage</p>
                      <p className="mt-0.5 text-xs text-ink-muted">Posted just now · 3 nearby workers notified</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-canvas">
                      Open to offers
                    </span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── FIND THE RIGHT PERSON ───────────────────── */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="max-w-lg font-display text-4xl tracking-tight text-ink sm:text-5xl">
                Find the right person, not a dispatch queue.
              </h2>
            </Reveal>

            <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
              <Reveal delay={0.15}>
                <TiltCard>
                  <div className="rounded-[1.75rem] border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
                    <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-ink-muted">
                      <Search size={16} />
                      <span>&ldquo;My electrical switchboard is damaged&rdquo;</span>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&crop=face" alt="Ramesh Kumar" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-ink">Ramesh Kumar</p>
                            <p className="text-sm text-ink-muted">Electrician · 8 yrs experience</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-dark">
                          <Star size={14} fill="currentColor" />
                          4.9
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                        <span className="rounded-full bg-surface-subtle px-3 py-1">Required skill ✓</span>
                        <span className="rounded-full bg-surface-subtle px-3 py-1">0.8 km away ✓</span>
                        <span className="rounded-full bg-surface-subtle px-3 py-1">Available now ✓</span>
                        <span className="rounded-full bg-surface-subtle px-3 py-1">Material available ✓</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-border pt-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 shrink-0 text-accent" size={18} />
                        <p className="text-sm text-ink-muted">
                          Live status while Ramesh travels — Booked → Travelling → Arrived → Working → Completed.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <MessageCircle className="mt-0.5 shrink-0 text-accent" size={18} />
                        <p className="text-sm text-ink-muted">Chat and call tied to the job — no generic inbox.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 shrink-0 text-accent" size={18} />
                        <p className="text-sm text-ink-muted">
                          Every extra cost needs your approval before it&apos;s added to the bill.
                        </p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>

              <Reveal delay={0.3}>
                <HeroVisual />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ───────────────────── BEFORE / AFTER ───────────────────── */}
        <section className="bg-surface-subtle px-6 py-28">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">From broken to done.</h2>
              <p className="mt-4 text-ink-muted">Every completed job comes with the proof.</p>
            </Reveal>
            <Reveal delay={0.15} className="mt-12">
              <BeforeAfterSlider />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── CUSTOMER JOURNEY ───────────────────── */}
        <section id="how-it-works" className="px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight text-ink">How it works for customers</h2>
            </Reveal>
            <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-border lg:block" />
              {CUSTOMER_STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div className="relative">
                    <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-canvas font-display text-base text-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-display text-lg text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-ink-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────── WORKER JOURNEY (dark) ───────────────────── */}
        <section id="for-workers" className="bg-ink px-6 py-28 text-canvas">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">For workers</span>
              <h2 className="mt-3 max-w-lg font-display text-4xl tracking-tight sm:text-5xl">
                Your skills. Your customers. Your business.
              </h2>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-5">
                {WORKER_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85">
                      {step}
                    </span>
                    {i < WORKER_STEPS.length - 1 && <ArrowRight size={14} className="shrink-0 text-white/25" />}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-16 grid gap-6 sm:grid-cols-3">
                {[
                  { icon: TrendingUp, label: "Set your own prices", body: "You decide what each service costs — not a platform algorithm." },
                  { icon: Users, label: "Real local demand", body: "Requests come from people nearby who already described what they need." },
                  { icon: Award, label: "Build a public reputation", body: "Every finished job adds to a worker passport you own and can show off." },
                ].map(({ icon: Icon, label, body }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Icon size={18} />
                    </span>
                    <p className="mt-4 font-display text-base">{label}</p>
                    <p className="mt-1.5 text-sm text-white/55">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <Link
                href="/signup"
                className="mt-12 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-105"
              >
                Become a worker
                <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── TRUST ───────────────────── */}
        <section id="trust" className="px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight text-ink">Trust, built into the product</h2>
              <p className="mt-2 max-w-lg text-ink-muted">
                Not a badge. Mechanisms that actually make a job traceable.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TRUST_MECHANISMS.map(({ label, body, icon: Icon }, i) => (
                <Reveal key={label} delay={i * 0.05}>
                  <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
                    <span className="icon-chip h-10 w-10 shrink-0">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{label}</p>
                      <p className="mt-1 text-sm text-ink-muted">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────── FINAL CTA ───────────────────── */}
        <section className="px-6 pb-28">
          <Reveal>
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-accent-dark to-accent p-10 text-white sm:flex-row sm:items-center sm:p-14">
              <div>
                <h2 className="max-w-md font-display text-3xl tracking-tight sm:text-4xl">
                  Something to fix? Someone to find?
                </h2>
                <p className="mt-3 max-w-sm text-white/80">
                  Join LocalHands today — as a customer, a worker, or both.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-accent-dark transition hover:bg-white/90"
                >
                  Get started <ArrowRight size={15} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/60"
                >
                  Log in
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-ink px-6 py-12 text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="font-display text-lg text-white">LocalHands</span>
            <p className="mt-1 text-sm">Your skills. Your services. Your customers. Your business.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BadgeCheck size={15} className="text-accent" />
            Every job, verified end to end.
          </div>
        </div>
      </footer>

      <FloatingCTA />
    </div>
  );
}
