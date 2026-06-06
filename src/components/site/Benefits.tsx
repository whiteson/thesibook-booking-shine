import { PhoneOff, Sparkles, TrendingUp, Globe, Megaphone, Heart } from "lucide-react";

const benefits = [
  { icon: PhoneOff, title: "Λιγότερα τηλεφωνήματα", desc: "Οι κρατήσεις γίνονται online, αυτόματα." },
  { icon: Sparkles, title: "Καλύτερη οργάνωση", desc: "Κάθε event, κράτηση και πελάτης σε ένα μέρος." },
  { icon: TrendingUp, title: "Περισσότερες κρατήσεις", desc: "Διαθεσιμότητα 24/7 σημαίνει περισσότερη ζήτηση." },
  { icon: Globe, title: "Επαγγελματική online παρουσία", desc: "Σύγχρονη σελίδα για κάθε σεμινάριο." },
  { icon: Megaphone, title: "Εύκολη προβολή σε νέους πελάτες", desc: "Αναζήτηση από χιλιάδες χρήστες στην Ελλάδα." },
  { icon: Heart, title: "Ιδανικό για μικρές και μεσαίες επιχειρήσεις", desc: "Σχεδιασμένο για την ελληνική αγορά." },
];

export function Benefits() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Οφέλη</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Γιατί να χρησιμοποιήσεις το ThesiBook;
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft/15 text-primary-soft">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
