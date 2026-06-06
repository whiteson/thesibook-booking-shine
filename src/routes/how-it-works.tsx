import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HowItWorks } from "@/components/site/HowItWorks";
import { AppPreview } from "@/components/site/AppPreview";
import { EarlyAccess } from "@/components/site/EarlyAccess";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Πώς λειτουργεί | ThesiBook" },
      { name: "description", content: "Δες σε 3 βήματα πώς το ThesiBook μετατρέπει τις κρατήσεις σου σε μια εύκολη online εμπειρία." },
      { property: "og:title", content: "Πώς λειτουργεί | ThesiBook" },
      { property: "og:description", content: "Από το στήσιμο μέχρι την πρώτη online κράτηση σε λίγα λεπτά." },
      { property: "og:url", content: "/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowPage,
});

function HowPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-10">
        <section className="mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Πώς λειτουργεί</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 απλά βήματα.
          </p>
        </section>
        <HowItWorks />
        <AppPreview />
        <EarlyAccess />
      </main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  );
}
