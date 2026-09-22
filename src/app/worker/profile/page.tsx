import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkerProfileManager, type WorkingHoursDay } from "@/components/worker-profile-manager";
import { PageHeader } from "@/components/page-header";

export default async function WorkerProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const [profile, categories] = await Promise.all([
    prisma.workerProfile.findUnique({
      where: { userId: user.id },
      include: {
        services: { include: { service: { include: { category: true } } } },
        products: { orderBy: { name: "asc" } },
        portfolio: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.category.findMany({ include: { services: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
  ]);

  if (!profile) redirect("/worker/onboarding");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="👷 Public profile"
        title="My Profile"
        description="This is what customers see when deciding whether to book you."
        action={
          <Link
            href={`/workers/${user.id}`}
            target="_blank"
            className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
          >
            <ExternalLink size={14} /> View my public passport
          </Link>
        }
        contained
      />
      <div className="mt-6">
        <WorkerProfileManager
          profile={{ ...profile, workingHours: profile.workingHours as unknown as WorkingHoursDay[] | null }}
          categories={categories}
        />
      </div>
    </div>
  );
}
