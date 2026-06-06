import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Δημιουργείς εκπαιδευτικά events και σεμινάρια",
  "Ορίζεις διαθέσιμες θέσεις και τιμές",
  "Διαχειρίζεσαι κρατήσεις σε ένα μέρος",
  "Δέχεσαι αιτήματα από νέους πελάτες",
  "Προωθείς τα μαθήματά σου online",
];

export function Solution() {
  return (
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Η λύση</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Το ThesiBook οργανώνει τις κρατήσεις σου σε <span className="text-gradient-brand">ένα μέρος</span>.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Όλη η δραστηριότητα της επιχείρησής σου — εκπαιδευτικά events, διαθέσιμες θέσεις, πελάτες, πληρωμές — σε μία απλή, σύγχρονη πλατφόρμα.
          </p>
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-soft" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-brand opacity-15 blur-3xl" />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium text-muted-foreground">
              {"ΔΕΥ ΤΡΙ ΤΕΤ ΠΕΜ ΠΑΡ ΣΑΒ ΚΥΡ".split(" ").map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2;
                const active = day === 22;
                const has = [5, 9, 14, 17, 22, 26, 29].includes(day);
                return (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-lg flex items-center justify-center text-xs font-medium " +
                      (active
                        ? "bg-gradient-brand text-primary-foreground"
                        : has
                        ? "bg-primary-soft/15 text-primary"
                        : "bg-muted/50 text-muted-foreground")
                    }
                  >
                    {day > 0 && day <= 31 ? day : ""}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 space-y-2">
              {[
                { t: "Thesis Writing Workshop", s: "10:00 — 12:00", n: "24/40" },
                { t: "Research Methodology", s: "13:00 — 15:00", n: "18/30" },
                { t: "Statistical Analysis", s: "16:00 — 18:00", n: "20/25" },
              ].map((e) => (
                <div key={e.t} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{e.t}</p>
                    <p className="text-xs text-muted-foreground">{e.s}</p>
                  </div>
                  <span className="rounded-full bg-primary-soft/15 px-2.5 py-1 text-xs font-semibold text-primary">{e.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
