import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkerOnboardingForm } from "@/components/worker-onboarding-form";

export default async function WorkerOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const categories = await prisma.category.findMany({
    include: { services: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">Step 1 of 1</span>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Set up your professional profile
      </h1>
      <p className="mt-2 text-ink-muted">
        This is what customers see when deciding whether to book you. Be specific.
      </p>

      <WorkerOnboardingForm categories={categories} />
    </main>
  );
}
