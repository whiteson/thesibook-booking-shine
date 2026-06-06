import { CalendarCheck, Layers, CalendarDays, Building2, FileText, Bell, Smartphone, Search } from "lucide-react";

const features = [
  { icon: CalendarCheck, title: "Online κρατήσεις", desc: "Οι πελάτες κρατούν θέση 24/7 χωρίς τηλεφωνήματα." },
  { icon: Layers, title: "Διαχείριση διαθέσιμων θέσεων", desc: "Όρισε χωρητικότητα, λίστες αναμονής και τιμές." },
  { icon: CalendarDays, title: "Ημερολόγιο σεμιναρίων", desc: "Όλα τα μαθήματα και workshops σε ένα view." },
  { icon: Building2, title: "Προφίλ επιχείρησης", desc: "Επαγγελματική παρουσία με branding και πληροφορίες." },
  { icon: FileText, title: "Σελίδα για κάθε σεμινάριο", desc: "Περιγραφή, εισηγητής, φωτογραφίες και CTA." },
  { icon: Bell, title: "Notifications", desc: "Αυτόματες υπενθυμίσεις και επιβεβαιώσεις." },
  { icon: Smartphone, title: "Mobile-friendly", desc: "Άψογη εμπειρία σε κινητό και tablet." },
  { icon: Search, title: "Αναζήτηση χρηστών", desc: "Φιλτράρισμα ανά περιοχή, κατηγορία και ημερομηνία." },
];

export function Features() {
  return (
    <section id="features" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Λειτουργίες</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
