import { Bell, Bookmark, Search, ChevronLeft } from "lucide-react";

export function AppPreview() {
  return (
    <section className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">App preview</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Μια εμπειρία σχεδιασμένη για κινητό.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Από την ανακάλυψη του σεμιναρίου μέχρι την επιλογή θέσης — όλα σε λίγα tap.
          </p>
        </div>
        <div className="mt-14 grid items-end gap-8 md:grid-cols-3">
          <PhoneSearch />
          <PhoneDetails />
          <PhoneSeats />
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

function PhoneSearch() {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-primary">ThesiBook</p>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" /> Αναζήτηση σεμιναρίων
        </div>
        <div className="mt-3 flex gap-1.5 overflow-hidden">
          {["Όλα", "Business", "Yoga", "Design"].map((c, i) => (
            <span key={c} className={"rounded-full px-2.5 py-1 text-[10px] font-semibold " + (i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{c}</span>
          ))}
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            { t: "Digital Marketing", l: "Αθήνα", s: "12 θέσεις" },
            { t: "Leadership Workshop", l: "Θεσσαλονίκη", s: "8 θέσεις" },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-border p-2">
              <div className="h-16 rounded-lg bg-gradient-brand opacity-80" />
              <p className="mt-2 text-xs font-semibold">{c.t}</p>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{c.l}</span>
                <span className="rounded-full bg-coral/15 px-1.5 py-0.5 font-semibold text-coral">{c.s}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function PhoneDetails() {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <ChevronLeft className="h-4 w-4" />
          <p className="text-xs font-semibold">Λεπτομέρειες</p>
          <Bookmark className="h-4 w-4 text-primary-soft" />
        </div>
        <div className="mt-3 h-28 rounded-xl bg-gradient-brand opacity-80" />
        <p className="mt-3 text-sm font-bold">Digital Marketing Seminar</p>
        <p className="text-[10px] text-muted-foreground">Αθήνα · 24 Μαΐου · 10:00 — 14:00</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Μάθε τις βασικές στρατηγικές του ψηφιακού μάρκετινγκ.
        </p>
        <div className="mt-3 rounded-xl bg-muted p-2.5">
          <p className="text-[10px] font-semibold">Εισηγητής</p>
          <p className="text-[11px] text-muted-foreground">Γιάννης Παπαδόπουλος</p>
        </div>
        <button className="mt-3 w-full rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-primary-foreground">
          Επιλογή θέσης · €49
        </button>
      </div>
    </PhoneFrame>
  );
}

function PhoneSeats() {
  return (
    <PhoneFrame>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <ChevronLeft className="h-4 w-4" />
          <p className="text-xs font-semibold">Επιλογή θέσης</p>
          <span className="w-4" />
        </div>
        <div className="mt-3 flex justify-center gap-2 text-[9px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary-soft" /> Διαθ.</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted-foreground/30" /> Κατ.</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-coral" /> Επιλ.</span>
        </div>
        <div className="mx-auto mt-3 h-10 w-3/4 rounded-b-full bg-primary-soft/20" />
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const taken = [2, 9, 13, 18, 22].includes(i);
            const selected = i === 14;
            return (
              <div
                key={i}
                className={
                  "aspect-square rounded-md " +
                  (selected ? "bg-coral" : taken ? "bg-muted-foreground/25" : "bg-primary-soft/80")
                }
              />
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted p-2.5">
          <div>
            <p className="text-[10px] text-muted-foreground">Θέση</p>
            <p className="text-sm font-bold">A5</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Τιμή</p>
            <p className="text-sm font-bold">€49</p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-primary-foreground">
          Συνέχεια
        </button>
      </div>
    </PhoneFrame>
  );
}
