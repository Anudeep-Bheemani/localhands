import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { CustomJobBoard } from "@/components/custom-job-board";

export default async function WorkerCustomJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!worker) redirect("/worker/onboarding");

  const customJobs = await prisma.customJob.findMany({
    where: { status: "OPEN" },
    include: { interests: { where: { workerId: user.id } } },
    orderBy: { createdAt: "desc" },
  });

  const cards = customJobs.map((cj) => ({
    id: cj.id,
    description: cj.description,
    tags: cj.tags,
    budget: cj.budget,
    preferredTime: cj.preferredTime,
    isUrgent: cj.isUrgent,
    locationAddress: cj.locationAddress,
    photoUrls: cj.photoUrls,
    distanceKm: distanceKm(worker.baseLat, worker.baseLng, cj.locationLat, cj.locationLng),
    alreadyInterested: cj.interests.length > 0,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink">Custom Jobs Board</h1>
      <p className="mt-1 text-ink-muted">One-off tasks that don&apos;t fit a fixed category.</p>
      <CustomJobBoard cards={cards} />
    </div>
  );
}
