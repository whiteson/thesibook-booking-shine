import { CheckCircle2 } from "lucide-react";
import type { SolutionSection } from "@/types/cms";

type Props = {
  section: SolutionSection;
};

export function SolutionSectionView({ section }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title}{" "}
            <span className="text-gradient-brand">{section.highlightedText}</span>
            .
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{section.description}</p>
          <ul className="mt-6 space-y-3">
            {section.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-soft" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-brand opacity-15 blur-3xl" />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium text-muted-foreground">
              {section.weekdays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: section.calendar.totalCells }).map((_, index) => {
                const day = index - section.calendar.startOffset + 1;
                const inMonth = day > 0 && day <= section.calendar.monthDays;
                const active = day === section.calendar.activeDay;
                const hasAvailability = section.calendar.availableDays.includes(day);

                return (
                  <div
                    key={index}
                    className={
                      "flex aspect-square items-center justify-center rounded-lg text-xs font-medium " +
                      (active
                        ? "bg-gradient-brand text-primary-foreground"
                        : hasAvailability
                          ? "bg-primary-soft/15 text-primary"
                          : "bg-muted/50 text-muted-foreground")
                    }
                  >
                    {inMonth ? day : ""}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 space-y-2">
              {section.events.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.schedule}</p>
                  </div>
                  <span className="rounded-full bg-primary-soft/15 px-2.5 py-1 text-xs font-semibold text-primary">
                    {event.occupancy}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
