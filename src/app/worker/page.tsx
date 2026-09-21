import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function WorkerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.profileComplete) redirect("/worker/onboarding");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Welcome back, {user.name}</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total earned</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">₹{profile.totalEarned.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Jobs completed</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{profile.jobsCompleted}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Average rating</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
