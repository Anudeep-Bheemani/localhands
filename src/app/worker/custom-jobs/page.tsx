import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { scoreTextAgainstSkills } from "@/lib/matching";
import { CustomJobBoard } from "@/components/custom-job-board";
import { PageHeader } from "@/components/page-header";

export default async function WorkerCustomJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: { services: { include: { service: { include: { category: true } } } } },
  });
  if (!worker) redirect("/worker/onboarding");

  const skillNames = [
    ...new Set([
      ...worker.services.flatMap((s) => [s.service.name, s.service.category.name]),
      ...worker.customSkills,
    ]),
  ];

  const customJobs = await prisma.customJob.findMany({
    where: { status: "OPEN" },
    include: { interests: { where: { workerId: user.id } } },
    orderBy: { createdAt: "desc" },
  });

  const cards = customJobs
    .map((cj) => {
      const text = `${cj.description} ${cj.tags.join(" ")}`;
      const matchScore = skillNames.length ? scoreTextAgainstSkills(text, skillNames) : 0;
      return {
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
        matchesSkills: matchScore > 0,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.distanceKm - b.distanceKm);

  return (
    <div>
      <PageHeader eyebrow="🛠️ Open board" title="Custom Jobs Board" description="One-off tasks that don't fit a fixed category." />
      <div className="mt-8">
        <CustomJobBoard cards={cards} />
      </div>
    </div>
  );
}
