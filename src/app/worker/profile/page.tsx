import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkerProfileManager } from "@/components/worker-profile-manager";

export default async function WorkerProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: {
      services: { include: { service: { include: { category: true } } } },
      products: { orderBy: { name: "asc" } },
      portfolio: true,
    },
  });

  if (!profile) redirect("/worker/onboarding");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">My Profile</h1>
          <p className="mt-1 text-ink-muted">This is what customers see when deciding whether to book you.</p>
        </div>
        <Link
          href={`/workers/${user.id}`}
          target="_blank"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-ink"
        >
          <ExternalLink size={14} /> View my public passport
        </Link>
      </div>
      <WorkerProfileManager profile={profile} />
    </div>
  );
}
