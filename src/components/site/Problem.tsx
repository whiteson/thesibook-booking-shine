import { PhoneOff, CalendarX, Wallet, Search } from "lucide-react";

const items = [
  { icon: PhoneOff, title: "Χαμένες κρατήσεις από μηνύματα και τηλεφωνήματα" },
  { icon: CalendarX, title: "Δυσκολία στη διαχείριση διαθέσιμων θέσεων" },
  { icon: Wallet, title: "Πληρωμές και συμμετοχές χωρίς οργάνωση" },
  { icon: Search, title: "Πελάτες που δεν βρίσκουν εύκολα διαθέσιμα μαθήματα" },
];

export function Problem() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Το πρόβλημα</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Οι κρατήσεις δεν χρειάζεται να γίνονται δύσκολα.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-coral">
                <it.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">{it.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
