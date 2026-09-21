import { CustomJobForm } from "@/components/custom-job-form";

export default function NewCustomJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">Custom job</span>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Something that doesn&apos;t fit a category?
      </h1>
      <p className="mt-2 text-ink-muted">
        Describe it in your own words — moving furniture, walking a dog, helping with an event.
        Nearby workers can browse and express interest, and you pick who does it.
      </p>
      <CustomJobForm />
    </div>
  );
}
