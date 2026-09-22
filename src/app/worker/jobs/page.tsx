import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { WorkerJobsList } from "@/components/worker-jobs-list";
import { PageHeader } from "@/components/page-header";

export default async function WorkerJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { workerId: user.id },
    include: { customer: true, service: { include: { category: true } }, customJob: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow="🧰 Pipeline" title="Jobs" description="Every request you've received, from first ask to final payment." />
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No booking requests yet"
          description="Complete your profile and add skills so customers can find and book you."
          actionLabel="Edit my profile"
          actionHref="/worker/profile"
        />
      ) : (
        <WorkerJobsList
          jobs={jobs.map((j) => ({
            id: j.id,
            status: j.status,
            isUrgent: j.isUrgent,
            createdAt: j.createdAt.toISOString(),
            scheduledFor: j.scheduledFor ? j.scheduledFor.toISOString() : null,
            initialEstimate: j.initialEstimate,
            confirmedTotal: j.confirmedTotal,
            customerName: j.customer.name,
            customerPhone: j.customer.phone,
            jobAddress: j.jobAddress,
            title: j.service ? `${j.service.category.name} — ${j.service.name}` : j.customJob ? "Custom job" : "Job",
          }))}
        />
      )}
    </div>
  );
}
