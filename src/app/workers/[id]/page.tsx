import { notFound } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { WorkerProfileView } from "@/components/worker-profile-view";
import type { WorkingHoursDay } from "@/components/worker-profile-manager";
import { LogoutButton } from "@/components/logout-button";
import { BrandLogo } from "@/components/brand-logo";

export default async function WorkerPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getCurrentUser();

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: id },
    include: {
      user: true,
      services: { include: { service: { include: { category: true } } } },
      products: true,
      portfolio: true,
      reviewsReceived: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!worker || !worker.profileComplete) notFound();

  const isOwnPassport = viewer?.id === id;
  const cta = isOwnPassport
    ? null
    : viewer?.role === "CUSTOMER"
    ? { label: `Book ${worker.user.name.split(" ")[0]}`, href: `/customer/worker/${id}` }
    : { label: "Sign in to book", href: "/login" };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <BrandLogo compact />
          <div className="flex items-center gap-3">
            {isOwnPassport && (
              <span className="hidden rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent sm:inline-block">
                This is your public passport
              </span>
            )}
            {viewer ? (
              <>
                <Link
                  href={viewer.role === "WORKER" ? "/worker" : "/customer"}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
                >
                  <LayoutDashboard size={13} /> Dashboard
                </Link>
                <LogoutButton compact />
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas transition hover:bg-accent-dark"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="px-6 py-10">
        <WorkerProfileView
          worker={{ ...worker, workingHours: worker.workingHours as unknown as WorkingHoursDay[] | null }}
          cta={cta}
          passportMode
        />
      </div>
    </div>
  );
}
