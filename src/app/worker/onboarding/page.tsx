import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkerOnboardingForm } from "@/components/worker-onboarding-form";
import { PageHeader } from "@/components/page-header";

export default async function WorkerOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/customer");

  const categories = await prisma.category.findMany({
    include: { services: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="🚀 Step 1 of 1"
        title="Set up your professional profile"
        description="This is what customers see when deciding whether to book you. Be specific."
        contained
      />

      <div className="mt-6">
        <WorkerOnboardingForm categories={categories} />
      </div>
    </div>
  );
}
