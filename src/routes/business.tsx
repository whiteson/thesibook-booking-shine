import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ForBusinesses } from "@/components/site/ForBusinesses";
import { Benefits } from "@/components/site/Benefits";
import { EarlyAccess } from "@/components/site/EarlyAccess";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Για επιχειρήσεις | ThesiBook" },
      { name: "description", content: "Το ThesiBook είναι σχεδιασμένο για εκπαιδευτικές επιχειρήσεις, ακαδημίες, coaches, studios και διοργανωτές σεμιναρίων στην Ελλάδα." },
      { property: "og:title", content: "Για επιχειρήσεις | ThesiBook" },
      { property: "og:description", content: "Δες πώς το ThesiBook βοηθά την επιχείρησή σου να γεμίσει τις θέσεις της." },
      { property: "og:url", content: "/business" },
    ],
    links: [{ rel: "canonical", href: "/business" }],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-10">
        <section className="mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Για επιχειρήσεις</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Μια πλατφόρμα φτιαγμένη για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.
          </p>
        </section>
        <ForBusinesses />
        <Benefits />
        <EarlyAccess />
      </main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  );
}
