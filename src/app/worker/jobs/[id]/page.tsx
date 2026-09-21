import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobWorkspace } from "@/components/job-workspace";

export default async function WorkerJobPage({ params }: { params: Promise<{ id: string }> }) {
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
      statusHistory: { orderBy: { timestamp: "asc" } },
      evidence: { orderBy: { createdAt: "asc" } },
      additionalWork: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (!job || job.workerId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <JobWorkspace initialJob={job as any} viewerRole="WORKER" />
    </div>
  );
}
