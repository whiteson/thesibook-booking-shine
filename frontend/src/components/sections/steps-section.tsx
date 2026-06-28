import type { StepsSection } from "@/types/cms";

type Props = {
  section: StepsSection;
};

export function StepsSectionView({ section }: Props) {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {section.steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl font-extrabold text-gradient-brand">
                  {step.number}
                </span>
                {index < section.steps.length - 1 ? (
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent md:ml-4 md:block" />
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
