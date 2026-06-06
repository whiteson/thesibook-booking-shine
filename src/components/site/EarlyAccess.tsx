import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const types = ["Σεμινάρια", "Φροντιστήριο", "Ακαδημία", "Workshop", "Yoga / Pilates", "Personal trainer", "Επαγγελματική κατάρτιση", "Ιδιωτικά μαθήματα", "Online courses", "Άλλο"];

export function EarlyAccess() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σου.");
  }

  return (
    <section id="early-access" className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elegant md:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-brand opacity-15 blur-3xl" aria-hidden />
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">Early access</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Θέλεις να είσαι από τους πρώτους στο ThesiBook;
              </h2>
              <p className="mt-4 text-muted-foreground">
                Συμπλήρωσε τα στοιχεία σου και θα επικοινωνήσουμε μαζί σου για early access στην πλατφόρμα.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Προτεραιότητα στο launch", "Δωρεάν onboarding", "Ειδικές τιμές για early adopters"].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary-soft" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/50 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Ευχαριστούμε!</h3>
                <p className="mt-2 text-sm text-muted-foreground">Λάβαμε το αίτημά σου. Θα σε ενημερώσουμε σύντομα στο email σου.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Ονοματεπώνυμο</Label>
                    <Input id="name" required placeholder="Μαρία Παπαδοπούλου" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@email.gr" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Τηλέφωνο</Label>
                    <Input id="phone" placeholder="69x xxx xxxx" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Όνομα επιχείρησης</Label>
                    <Input id="company" placeholder="π.χ. Athena Academy" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Τύπος επιχείρησης</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-ring"
                    defaultValue=""
                  >
                    <option value="" disabled>Επίλεξε...</option>
                    {types.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Μήνυμα</Label>
                  <Textarea id="message" placeholder="Πες μας λίγα λόγια για την επιχείρησή σου..." rows={3} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-95">
                  Ζήτησε πρόσβαση
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
