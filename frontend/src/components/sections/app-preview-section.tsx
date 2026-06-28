import { Bell, Bookmark, ChevronLeft, Search } from "lucide-react";
import type { AppPreviewSection } from "@/types/cms";

type Props = {
  section: AppPreviewSection;
};

export function AppPreviewSectionView({ section }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{section.description}</p>
        </div>
        <div className="mt-14 grid items-end gap-8 md:grid-cols-3">
          <PhoneDiscover section={section} />
          <PhoneDetails section={section} />
          <PhoneSeats section={section} />
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-elegant">
      <div className="relative overflow-hidden rounded-[2rem] bg-background">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
        <div className="pt-8">{children}</div>
      </div>
    </div>
  );
}

function PhoneDiscover({ section }: Props) {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-primary">{section.discover.brand}</p>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          {section.discover.searchPlaceholder}
        </div>
        <div className="mt-3 flex gap-1.5 overflow-hidden">
          {section.discover.categories.map((category, index) => (
            <span
              key={category}
              className={
                "rounded-full px-2.5 py-1 text-[10px] font-semibold " +
                (index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground")
              }
            >
              {category}
            </span>
          ))}
        </div>
        <div className="mt-3 space-y-2.5">
          {section.discover.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-border p-2">
              <div className="h-16 rounded-lg bg-gradient-brand opacity-80" />
              <p className="mt-2 text-xs font-semibold">{card.title}</p>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{card.location}</span>
                <span className="rounded-full bg-coral/15 px-1.5 py-0.5 font-semibold text-coral">
                  {card.seats}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function PhoneDetails({ section }: Props) {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <ChevronLeft className="h-4 w-4" />
          <p className="text-xs font-semibold">{section.details.topBarLabel}</p>
          <Bookmark className="h-4 w-4 text-primary-soft" />
        </div>
        <div className="mt-3 h-28 rounded-xl bg-gradient-brand opacity-80" />
        <p className="mt-3 text-sm font-bold">{section.details.title}</p>
        <p className="text-[10px] text-muted-foreground">{section.details.subtitle}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {section.details.description}
        </p>
        <div className="mt-3 rounded-xl bg-muted p-2.5">
          <p className="text-[10px] font-semibold">{section.details.speakerLabel}</p>
          <p className="text-[11px] text-muted-foreground">
            {section.details.speakerValue}
          </p>
        </div>
        <button className="mt-3 w-full rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-primary-foreground">
          {section.details.ctaLabel}
        </button>
      </div>
    </PhoneFrame>
  );
}

function PhoneSeats({ section }: Props) {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <ChevronLeft className="h-4 w-4" />
          <p className="text-xs font-semibold">{section.seatPicker.topBarLabel}</p>
          <span className="w-4" />
        </div>
        <div className="mt-3 flex justify-center gap-2 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-primary-soft" />
            {section.seatPicker.availableLabel}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-muted-foreground/30" />
            {section.seatPicker.takenLabel}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-coral" />
            {section.seatPicker.selectedLabel}
          </span>
        </div>
        <div className="mx-auto mt-3 h-10 w-3/4 rounded-b-full bg-primary-soft/20" />
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {Array.from({ length: section.seatPicker.totalSeats }).map((_, index) => {
            const taken = section.seatPicker.takenIndexes.includes(index);
            const selected = section.seatPicker.selectedIndex === index;
            return (
              <div
                key={index}
                className={
                  "aspect-square rounded-md " +
                  (selected
                    ? "bg-coral"
                    : taken
                      ? "bg-muted-foreground/25"
                      : "bg-primary-soft/80")
                }
              />
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted p-2.5">
          <div>
            <p className="text-[10px] text-muted-foreground">
              {section.seatPicker.selectedLabel}
            </p>
            <p className="text-sm font-bold">{section.seatPicker.selectedSeat}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">
              {section.seatPicker.priceLabel}
            </p>
            <p className="text-sm font-bold">{section.seatPicker.price}</p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-primary-foreground">
          {section.seatPicker.ctaLabel}
        </button>
      </div>
    </PhoneFrame>
  );
}
