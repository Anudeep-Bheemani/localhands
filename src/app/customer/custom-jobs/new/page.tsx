import { CustomJobForm } from "@/components/custom-job-form";
import { PageHeader } from "@/components/page-header";

export default function NewCustomJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="✨ Custom job"
        title="Something that doesn't fit a category?"
        description="Describe it in your own words — moving furniture, walking a dog, helping with an event. Nearby workers can browse and express interest, and you pick who does it."
        contained
      />
      <div className="mt-6">
        <CustomJobForm />
      </div>
    </div>
  );
}
