import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const types = [
  "Σεμινάρια",
  "Φροντιστήρια",
  "Ακαδημίες",
  "Workshops",
  "Yoga / Pilates studios",
  "Personal trainers",
  "Επαγγελματική κατάρτιση",
  "Ιδιωτικά μαθήματα",
  "Online courses",
];

export function ForBusinesses() {
  return (
    <section id="business" className="relative bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Για επιχειρήσεις</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Για εκπαιδευτικές επιχειρήσεις, coaches και διοργανωτές σεμιναρίων.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Το ThesiBook έχει σχεδιαστεί για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {types.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-soft/60"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-95">
            <a href="#early-access">
              Θέλω να μπω στην πλατφόρμα <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
