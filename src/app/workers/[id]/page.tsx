import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { WorkerProfileView } from "@/components/worker-profile-view";
import type { WorkingHoursDay } from "@/components/worker-profile-manager";

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
          <Link href="/" className="font-display italic text-lg text-ink">
            LocalHands
          </Link>
          {isOwnPassport && (
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              This is your public passport
            </span>
          )}
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
