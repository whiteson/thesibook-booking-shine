import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail } from "lucide-react";



export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="h-9" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Η νέα πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις στην Ελλάδα.
            </p>
            <a href="mailto:hello@thesibook.gr" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-soft">
              <Mail className="h-4 w-4" /> hello@thesibook.gr
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold">Πλοήγηση</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#top" className="hover:text-foreground">Αρχική</a></li>
              <li><a href="#business" className="hover:text-foreground">Για επιχειρήσεις</a></li>
              <li><a href="#contact" className="hover:text-foreground">Επικοινωνία</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Νομικά</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ThesiBook. Με αγάπη από την Ελλάδα.</p>
          <p>Κλείσε τη θέση σου εύκολα.</p>
        </div>
      </div>
    </footer>
  );
}
