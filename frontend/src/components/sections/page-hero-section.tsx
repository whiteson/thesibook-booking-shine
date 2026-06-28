import type { PageHeroSection } from "@/types/cms";

type Props = {
  section: PageHeroSection;
};

export function PageHeroSectionView({ section }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-2 pt-12 text-center sm:px-6 lg:px-8">
      {section.eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
          {section.eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
        {section.title}
      </h1>
      {section.description ? (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {section.description}
        </p>
      ) : null}
    </section>
  );
}
