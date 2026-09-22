import { prisma } from "@/lib/db";
import { CustomerHomeForm } from "@/components/customer-home-form";
import { PageHeader } from "@/components/page-header";

export default async function CustomerHome() {
  const categories = await prisma.category.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="👋 Welcome back"
        title="What do you need help with?"
        description="Describe your problem, browse a category, or post a custom job."
      />

      <CustomerHomeForm categories={categories} />
    </div>
  );
}
