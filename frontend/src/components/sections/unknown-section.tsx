import type { UnknownSection } from "@/types/cms";

type Props = {
  section: UnknownSection;
};

export function UnknownSectionView({ section }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Unknown section type: <span className="font-medium">{section.layoutType}</span>
      </div>
    </section>
  );
}
