import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobChat } from "@/components/job-chat";

export default async function CustomerJobChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { worker: { include: { user: true } } } });
  if (!job || job.customerId !== user.id) notFound();

  return <JobChat jobId={id} viewerId={user.id} otherPartyName={job.worker.user.name} />;
}
