import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle2, MapPin, Users } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-soft">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center animate-fade-in-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" /> Early access · Ελλάδα
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Η πιο εύκολη πλατφόρμα κρατήσεων για{" "}
            <span className="text-gradient-brand">σεμινάρια, μαθήματα</span> και εκπαιδευτικές επιχειρήσεις στην Ελλάδα.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Με το ThesiBook, οι πελάτες βρίσκουν διαθέσιμες θέσεις, κάνουν κράτηση online και οι επιχειρήσεις οργανώνουν εύκολα τα προγράμματά τους.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-95">
              <a href="#early-access">
                Ζήτησε early access <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border">
              <a href="#how">Δες πώς λειτουργεί</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-soft" /> Χωρίς πιστωτική κάρτα</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-soft" /> Στήσιμο σε λεπτά</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-soft" /> Στα Ελληνικά</span>
          </div>
        </div>

        <div className="relative animate-fade-in-up">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-elegant">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Καλώς ήρθες</p>
            <p className="text-base font-semibold">Πίνακας ελέγχου</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground text-sm font-bold">A</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { l: "Επόμενα", v: "12", i: Calendar },
            { l: "Κρατήσεις", v: "128", i: Users },
            { l: "Θέσεις", v: "340", i: MapPin },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-muted/60 p-3">
              <s.i className="h-4 w-4 text-primary-soft" />
              <p className="mt-2 text-xs text-muted-foreground">{s.l}</p>
              <p className="text-lg font-bold">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Digital Marketing Seminar</p>
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral">12 θέσεις</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">24 Μαΐου · 10:00 — 14:00 · Αθήνα</p>
          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {Array.from({ length: 24 }).map((_, i) => {
              const taken = [3, 7, 11, 16].includes(i);
              const selected = i === 14;
              return (
                <div
                  key={i}
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
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-brand p-3 text-primary-foreground">
          <p className="text-sm font-medium">Επιλεγμένη θέση: A5</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">€49</span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-3 shadow-elegant sm:block animate-float">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/15 text-coral">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Νέα κράτηση</p>
            <p className="text-sm font-semibold">Leadership Workshop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
