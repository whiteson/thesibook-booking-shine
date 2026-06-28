import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ForBusinessesSection } from "@/types/cms";

type Props = {
  section: ForBusinessesSection;
};

export function ForBusinessesSectionView({ section }: Props) {
  return (
    <section className="relative bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{section.description}</p>
        </div>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {section.businessTypes.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-soft/60"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href={section.cta.href} target={section.cta.target}>
            <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-elegant">
              {section.cta.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
