const steps = [
  { n: "01", title: "Δημιουργείς το προφίλ σου", desc: "Στήσε την επιχείρησή σου σε λίγα λεπτά με logo, περιγραφή και στοιχεία επικοινωνίας." },
  { n: "02", title: "Προσθέτεις μαθήματα και θέσεις", desc: "Όρισε ημερομηνίες, χωρητικότητα, τιμή και πληροφορίες για κάθε σεμινάριο." },
  { n: "03", title: "Οι πελάτες κάνουν κράτηση online", desc: "Δέχεσαι κρατήσεις 24/7, αυτόματες επιβεβαιώσεις και υπενθυμίσεις." },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Πώς λειτουργεί</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 βήματα.
          </h2>
        </div>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-5xl font-extrabold text-gradient-brand">{s.n}</span>
                {i < steps.length - 1 && (
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent md:ml-4 md:block" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
