import { getLucideIcon } from "@/components/sections/icon-map";
import type { IconGridSection } from "@/types/cms";

type Props = {
  section: IconGridSection;
};

export function IconGridSectionView({ section }: Props) {
  const columnsClass =
    section.variant === "benefits"
      ? "md:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  const iconContainerClass =
    section.variant === "features"
      ? "bg-gradient-brand text-primary-foreground"
      : section.variant === "benefits"
        ? "bg-primary-soft/15 text-primary-soft"
        : "bg-coral/10 text-coral";

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
          {section.description ? (
            <p className="mt-4 text-lg text-muted-foreground">
              {section.description}
            </p>
          ) : null}
        </div>
        <div className={`mt-12 grid gap-5 ${columnsClass}`}>
          {section.items.map((item) => {
            const Icon = getLucideIcon(item.icon);
            return (
              <div
                key={`${item.icon}-${item.title}`}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconContainerClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                {item.description ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
