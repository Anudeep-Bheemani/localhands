import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";
import { buildMatchReasons } from "@/lib/matching";
import { WorkerDiscoveryList, type WorkerCard } from "@/components/worker-discovery-list";
import { PageHeader } from "@/components/page-header";

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/worker");

  const [favorites, categories] = await Promise.all([
    prisma.favorite.findMany({
      where: { customerId: user.id },
      include: {
        worker: {
          include: {
            user: true,
            services: { include: { service: { include: { category: true } } } },
            products: true,
            portfolio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ include: { services: true }, orderBy: { name: "asc" } }),
  ]);

  const cards: WorkerCard[] = favorites.map((f) => {
    const w = f.worker;
    const dist = distanceKm(DEFAULT_LAT, DEFAULT_LNG, w.baseLat, w.baseLng);
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
      skills: [...new Set([...w.services.map((s) => s.service.name), ...w.customSkills])],
      categoryNames: [...new Set(w.services.map((s) => s.service.category.name))],
      reasons,
      score,
      portfolioCount: w.portfolio.length,
      isFavorite: true,
    };
  });

  return (
    <div>
      <PageHeader eyebrow="💚 Saved" title="Favorites" description="Workers you've saved for next time." />

      {cards.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-ink-muted">No favorites yet — tap the heart on a worker&apos;s card to save them here.</p>
        </div>
      ) : (
        <div className="mt-6">
          <WorkerDiscoveryList
            cards={cards}
            categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }))}
            matchedServiceName={null}
            matchedCategoryName={null}
            problem=""
            searchParamsRaw={{}}
            hideHeader
          />
        </div>
      )}
    </div>
  );
}
