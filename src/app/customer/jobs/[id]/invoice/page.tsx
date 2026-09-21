import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InvoiceView } from "@/components/invoice-view";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      worker: { include: { user: true } },
      service: { include: { category: true } },
      jobProducts: { include: { workerProduct: true } },
      additionalWork: { where: { status: "APPROVED" } },
    },
  });

  if (!job || job.customerId !== user.id) notFound();

  return <InvoiceView job={job} />;
}
