import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLucideIcon } from "@/components/sections/icon-map";
import type { HeroSection } from "@/types/cms";

type Props = {
  section: HeroSection;
};

export function HeroSectionView({ section }: Props) {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-soft">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center animate-fade-in-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            {section.badge}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {section.title}{" "}
            <span className="text-gradient-brand">{section.highlightedText}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {section.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={section.primaryCta.href} target={section.primaryCta.target}>
              <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-elegant">
                {section.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {section.secondaryCta?.label ? (
              <Link
                href={section.secondaryCta.href}
                target={section.secondaryCta.target}
              >
                <Button size="lg" variant="outline" className="border-border">
                  {section.secondaryCta.label}
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {section.trustBullets.map((bullet) => {
              const Icon = getLucideIcon(bullet.icon);
              return (
                <span key={bullet.title} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary-soft" />
                  {bullet.title}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative animate-fade-in-up">
          <HeroMockup section={section} />
        </div>
      </div>
    </section>
  );
}

function HeroMockup({ section }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-elegant">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs text-muted-foreground">{section.dashboardSubtitle}</p>
            <p className="text-base font-semibold">{section.dashboardTitle}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
            {section.dashboardAvatarLabel}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {section.stats.map((stat) => {
            const Icon = getLucideIcon(stat.icon);
            return (
              <div key={stat.label} className="rounded-2xl bg-muted/60 p-3">
                <Icon className="h-4 w-4 text-primary-soft" />
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{section.featuredEvent.title}</p>
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral">
              {section.featuredEvent.seatsLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {section.featuredEvent.meta}
          </p>
          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {Array.from({ length: section.featuredEvent.totalSeats }).map(
              (_, index) => {
                const taken = section.featuredEvent.takenIndexes.includes(index);
                const selected = section.featuredEvent.selectedIndex === index;
                return (
                  <div
                    key={index}
                    className={
                      "aspect-square rounded-md " +
                      (selected
                        ? "bg-coral"
                        : taken
                          ? "bg-muted"
                          : "bg-primary-soft/80")
                    }
                  />
                );
              },
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-brand p-3 text-primary-foreground">
          <p className="text-sm font-medium">
            {section.featuredEvent.selectedSeatLabel}
          </p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {section.featuredEvent.priceLabel}
          </span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-3 shadow-elegant sm:block animate-float">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/15 text-coral">
            {(() => {
              const Icon = getLucideIcon(section.floatingCard.icon);
              return <Icon className="h-5 w-5" />;
            })()}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{section.floatingCard.label}</p>
            <p className="text-sm font-semibold">{section.floatingCard.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
