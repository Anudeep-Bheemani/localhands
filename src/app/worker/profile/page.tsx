import { redirect } from "next/navigation";
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
      <h1 className="font-display text-3xl tracking-tight text-ink">My Profile</h1>
      <p className="mt-1 text-ink-muted">This is what customers see when deciding whether to book you.</p>
      <WorkerProfileManager profile={profile} />
    </div>
  );
}
