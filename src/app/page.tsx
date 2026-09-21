import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "WORKER" ? "/worker" : "/customer");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-neutral-50 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
        LocalHands
      </p>
      <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-neutral-900">
        Local work, connected.
      </h1>
      <p className="mt-4 max-w-md text-neutral-500">
        One trusted place to find, choose, talk to, track, pay, and remember every
        local service worker — from fixing a switch to moving furniture.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-white"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
