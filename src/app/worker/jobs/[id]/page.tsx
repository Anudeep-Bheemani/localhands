import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobWorkspace } from "@/components/job-workspace";
import { jobWorkspaceInclude } from "@/lib/job-select";

export default async function WorkerJobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: jobWorkspaceInclude,
  });

  if (!job || job.workerId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <JobWorkspace initialJob={job as any} viewerRole="WORKER" />
    </div>
  );
}
