import { getLucideIcon } from "@/components/sections/icon-map";
import type { ContactCardsSection } from "@/types/cms";

type Props = {
  section: ContactCardsSection;
};

export function ContactCardsSectionView({ section }: Props) {
  return (
    <section className="mx-auto mt-12 grid max-w-5xl gap-5 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
      {section.cards.map((card) => {
        const Icon = getLucideIcon(card.icon);

        return (
          <a
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold">{card.title}</p>
            <p className="text-sm text-muted-foreground">{card.value}</p>
          </a>
        );
      })}
    </section>
  );
}
