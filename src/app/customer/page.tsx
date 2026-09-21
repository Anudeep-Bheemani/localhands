import { prisma } from "@/lib/db";
import { CustomerHomeForm } from "@/components/customer-home-form";

export default async function CustomerHome() {
  const categories = await prisma.category.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        What do you need help with?
      </h1>
      <p className="mt-2 text-ink-muted">
        Describe your problem, browse a category, or post a custom job.
      </p>

      <CustomerHomeForm categories={categories} />
    </div>
  );
}
