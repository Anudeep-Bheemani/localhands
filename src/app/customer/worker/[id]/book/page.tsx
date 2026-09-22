import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BookingForm } from "@/components/booking-form";
import { PageHeader } from "@/components/page-header";

export default async function BookWorkerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: id },
    include: {
      user: true,
      services: { include: { service: { include: { category: true } } } },
      products: { where: { inStock: true } },
    },
  });

  if (!worker || !worker.profileComplete) notFound();

  const preselectedServiceId = sp.service ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="📝 Booking request"
        title={`Book ${worker.user.name.split(" ")[0]}`}
        description={`${worker.user.name} will accept or decline this request before anything is confirmed.`}
        contained
      />

      <div className="mt-6">
      <BookingForm
        worker={{
          id: worker.userId,
          name: worker.user.name,
          services: worker.services.map((s) => ({
            id: s.serviceId,
            name: s.service.name,
            category: s.service.category.name,
            price: s.price,
          })),
          products: worker.products.map((p) => ({ id: p.id, name: p.name, price: p.price, stockQty: p.stockQty })),
        }}
        preselectedServiceId={preselectedServiceId}
        initialProblem={sp.problem ?? ""}
        initialPhotoUrl={sp.photoUrl ?? null}
        initialVoiceUrl={sp.voiceUrl ?? null}
        jobLat={sp.lat ? Number(sp.lat) : null}
        jobLng={sp.lng ? Number(sp.lng) : null}
        jobAddress={sp.address ?? ""}
      />
      </div>
    </div>
  );
}
