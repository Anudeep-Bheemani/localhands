import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WorkerProfileView } from "@/components/worker-profile-view";

export default async function WorkerProfilePage({
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
      products: true,
      portfolio: true,
      reviewsReceived: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!worker || !worker.profileComplete) notFound();

  const bookHref = `/customer/worker/${id}/book?${new URLSearchParams(sp as Record<string, string>).toString()}`;

  return (
    <WorkerProfileView
      worker={worker}
      cta={{ label: `Book ${worker.user.name.split(" ")[0]}`, href: bookHref }}
    />
  );
}
