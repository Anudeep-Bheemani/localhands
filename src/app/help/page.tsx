import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { CUSTOMER_NAV, WORKER_NAV } from "@/lib/nav-items";
import { BrandLogo } from "@/components/brand-logo";

async function HelpContent() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-tight text-ink">Help & support</h1>

      <section className="mt-8">
        <h2 className="font-display text-lg text-ink">Frequently asked</h2>
        <div className="mt-3 flex flex-col gap-4 text-sm text-ink-muted">
          <div>
            <p className="font-medium text-ink">How does booking work?</p>
            <p className="mt-1">
              Describe your problem or pick a category, choose a worker from the matches, and send a booking
              request. The worker accepts or declines — nothing is confirmed until they accept.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">How is the price decided?</p>
            <p className="mt-1">
              You see an initial estimate before booking. Once the worker diagnoses the job on site, they propose
              a final scope and price which you approve before any work begins. Any extra work found later also
              needs your approval before it&apos;s added to the bill.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">How does live tracking work?</p>
            <p className="mt-1">Tracking is simulated for this build — the marker animates along the route for demo purposes, not real GPS.</p>
          </div>
          <div>
            <p className="font-medium text-ink">Is payment real?</p>
            <p className="mt-1">Payment is mocked for this build — no real money moves. It records the method and marks the invoice paid.</p>
          </div>
        </div>
      </section>

      <section id="terms" className="mt-10">
        <h2 className="font-display text-lg text-ink">Terms</h2>
        <p className="mt-3 text-sm text-ink-muted">
          LocalHands connects independent customers and independent service workers. It does not employ workers
          or guarantee the quality of work performed. Workers are responsible for the services they provide;
          customers are responsible for verifying a worker&apos;s suitability for their job before booking.
        </p>
      </section>

      <section id="contact" className="mt-10 pb-10">
        <h2 className="font-display text-lg text-ink">Contact</h2>
        <p className="mt-3 text-sm text-ink-muted">
          For anything not covered here, reach out at{" "}
          <a href="mailto:support@localhands.example" className="text-accent hover:underline">
            support@localhands.example
          </a>
          . If you have a problem with a specific job, use the &ldquo;Report a problem&rdquo; link on that job&apos;s page.
        </p>
      </section>
    </div>
  );
}

export default async function HelpPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-canvas">
        <header className="border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
            <BrandLogo compact />
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas transition hover:bg-accent-dark"
              >
                Get started
              </Link>
            </div>
          </div>
        </header>
        <div className="px-6 py-12">
          <HelpContent />
        </div>
      </div>
    );
  }

  return (
    <DashboardShell userName={user.name} role={user.role} navItems={user.role === "CUSTOMER" ? CUSTOMER_NAV : WORKER_NAV}>
      <HelpContent />
    </DashboardShell>
  );
}
