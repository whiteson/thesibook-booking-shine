import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Features } from "@/components/site/Features";
import { Solution } from "@/components/site/Solution";
import { FAQ } from "@/components/site/FAQ";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Λειτουργίες | ThesiBook" },
      { name: "description", content: "Online κρατήσεις, διαχείριση θέσεων, ημερολόγιο, notifications και όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου." },
      { property: "og:title", content: "Λειτουργίες | ThesiBook" },
      { property: "og:description", content: "Όλες οι λειτουργίες του ThesiBook σε ένα μέρος." },
      { property: "og:url", content: "/features" },
    ],
    links: [{ rel: "canonical", href: "/features" }],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-10">
        <section className="mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Λειτουργίες</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Όλα όσα χρειάζεσαι για να οργανώσεις και να γεμίσεις τα σεμινάριά σου.
          </p>
        </section>
        <Features />
        <Solution />
        <FAQ />
      </main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  );
}
