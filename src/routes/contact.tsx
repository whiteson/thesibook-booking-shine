import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EarlyAccess } from "@/components/site/EarlyAccess";
import { Toaster } from "@/components/ui/sonner";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Επικοινωνία | ThesiBook" },
      { name: "description", content: "Επικοινώνησε με την ομάδα του ThesiBook για early access, συνεργασίες ή ερωτήσεις." },
      { property: "og:title", content: "Επικοινωνία | ThesiBook" },
      { property: "og:description", content: "Είμαστε εδώ για να σε βοηθήσουμε." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-10">
        <section className="mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Επικοινωνία</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Πες μας περισσότερα για την επιχείρησή σου και θα σου απαντήσουμε σύντομα.
          </p>
        </section>

        <section className="mx-auto mt-12 grid max-w-5xl gap-5 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Mail, title: "Email", value: "hello@thesibook.gr", href: "mailto:hello@thesibook.gr" },
            { icon: MessageCircle, title: "Support", value: "Συνήθως απαντάμε σε 24 ώρες", href: "#" },
            { icon: MapPin, title: "Έδρα", value: "Αθήνα, Ελλάδα", href: "#" },
          ].map((c) => (
            <a key={c.title} href={c.href} className="rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.value}</p>
            </a>
          ))}
        </section>

        <EarlyAccess />
      </main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  );
}
