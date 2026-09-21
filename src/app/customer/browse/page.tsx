import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { distanceKm } from "@/lib/geo";
import { buildMatchReasons } from "@/lib/matching";
import { WorkerDiscoveryList, type WorkerCard } from "@/components/worker-discovery-list";

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : DEFAULT_LAT;
  const lng = sp.lng ? Number(sp.lng) : DEFAULT_LNG;

  const categories = await prisma.category.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });

  const targetCategory = sp.category ? categories.find((c) => c.slug === sp.category) ?? null : null;
  const candidateServiceIds = targetCategory ? targetCategory.services.map((s) => s.id) : null;

  const [workers, user] = await Promise.all([
    prisma.workerProfile.findMany({
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
    }),
    getCurrentUser(),
  ]);

  const favoriteIds = user
    ? new Set((await prisma.favorite.findMany({ where: { customerId: user.id }, select: { workerId: true } })).map((f) => f.workerId))
    : new Set<string>();

  const cards: WorkerCard[] = workers.map((w) => {
    const dist = distanceKm(lat, lng, w.baseLat, w.baseLng);
    const { reasons, score } = buildMatchReasons({
      hasRequiredSkill: true,
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
      price: Math.min(...w.services.map((s) => s.price), Infinity),
      skills: [...new Set(w.services.map((s) => s.service.name))],
      categoryNames: [...new Set(w.services.map((s) => s.service.category.name))],
      reasons,
      score,
      portfolioCount: w.portfolio.length,
      isFavorite: favoriteIds.has(w.userId),
    };
  });

  cards.sort((a, b) => b.ratingAvg - a.ratingAvg);

  return (
    <WorkerDiscoveryList
      cards={cards}
      categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }))}
      matchedServiceName={null}
      matchedCategoryName={targetCategory?.name ?? null}
      problem=""
      searchParamsRaw={sp}
    />
  );
}
