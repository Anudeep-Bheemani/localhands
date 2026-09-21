import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { matchServiceFromText, buildMatchReasons } from "@/lib/matching";
import { WorkerDiscoveryList, type WorkerCard } from "@/components/worker-discovery-list";

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : DEFAULT_LAT;
  const lng = sp.lng ? Number(sp.lng) : DEFAULT_LNG;
  const problem = sp.problem ?? "";

  const categories = await prisma.category.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });

  let targetCategorySlug = sp.category ?? null;
  let targetServiceId = sp.service ?? null;
  let matchedServiceName: string | null = null;

  if (!targetCategorySlug && !targetServiceId && problem) {
    const match = matchServiceFromText(problem, categories);
    if (match) {
      targetCategorySlug = match.category.slug;
      targetServiceId = match.service.id;
      matchedServiceName = match.service.name;
    }
  }

  const targetCategory = categories.find((c) => c.slug === targetCategorySlug) ?? null;
  if (!matchedServiceName && targetServiceId) {
    matchedServiceName = targetCategory?.services.find((s) => s.id === targetServiceId)?.name ?? null;
  }

  const candidateServiceIds = targetServiceId
    ? [targetServiceId]
    : targetCategory
    ? targetCategory.services.map((s) => s.id)
    : null;

  const workers = await prisma.workerProfile.findMany({
    where: {
      profileComplete: true,
      ...(candidateServiceIds ? { services: { some: { serviceId: { in: candidateServiceIds } } } } : {}),
    },
    include: {
      user: true,
      services: { include: { service: { include: { category: true } } } },
      products: true,
      portfolio: true,
    },
  });

  const cards: WorkerCard[] = workers.map((w) => {
    const dist = distanceKm(lat, lng, w.baseLat, w.baseLng);
    const matchedService = targetServiceId ? w.services.find((s) => s.serviceId === targetServiceId) : null;
    const price = matchedService?.price ?? Math.min(...w.services.map((s) => s.price), Infinity);
    const { reasons, score } = buildMatchReasons({
      hasRequiredSkill: targetServiceId ? Boolean(matchedService) : true,
      distanceKm: dist,
      serviceRadiusKm: w.serviceRadiusKm,
      availableNow: w.availableNow,
      jobsCompleted: w.jobsCompleted,
      hasMaterial: w.products.some((p) => p.inStock),
    });

    return {
      id: w.userId,
      name: w.user.name,
      profilePhotoUrl: w.profilePhotoUrl,
      bio: w.bio,
      experienceYears: w.experienceYears,
      ratingAvg: w.ratingAvg,
      jobsCompleted: w.jobsCompleted,
      availableNow: w.availableNow,
      identityVerified: w.identityVerified,
      distanceKm: dist,
      price,
      skills: [...new Set(w.services.map((s) => s.service.name))],
      categoryNames: [...new Set(w.services.map((s) => s.service.category.name))],
      reasons,
      score,
      portfolioCount: w.portfolio.length,
    };
  });

  cards.sort((a, b) => b.score - a.score);

  return (
    <WorkerDiscoveryList
      cards={cards}
      categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }))}
      matchedServiceName={matchedServiceName}
      matchedCategoryName={targetCategory?.name ?? null}
      problem={problem}
      searchParamsRaw={sp}
    />
  );
}
