import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobChat } from "@/components/job-chat";

export default async function WorkerJobChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { customer: true } });
  if (!job || job.workerId !== user.id) notFound();

  return <JobChat jobId={id} viewerId={user.id} otherPartyName={job.customer.name} />;
}
