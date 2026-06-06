import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Solution } from "@/components/site/Solution";
import { Features } from "@/components/site/Features";
import { ForBusinesses } from "@/components/site/ForBusinesses";
import { HowItWorks } from "@/components/site/HowItWorks";
import { AppPreview } from "@/components/site/AppPreview";
import { Benefits } from "@/components/site/Benefits";
import { EarlyAccess } from "@/components/site/EarlyAccess";
import { FAQ } from "@/components/site/FAQ";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThesiBook | Πλατφόρμα κρατήσεων για σεμινάρια και εκπαιδευτικές επιχειρήσεις" },
      {
        name: "description",
        content:
          "Το ThesiBook βοηθά εκπαιδευτικές επιχειρήσεις, coaches, ακαδημίες και διοργανωτές σεμιναρίων στην Ελλάδα να δέχονται online κρατήσεις και να οργανώνουν διαθέσιμες θέσεις εύκολα.",
      },
      { property: "og:title", content: "ThesiBook | Κλείσε τη θέση σου εύκολα" },
      {
        property: "og:description",
        content: "Online κρατήσεις για σεμινάρια, workshops, ακαδημίες και training businesses στην Ελλάδα.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ThesiBook",
          url: "https://thesibook.gr",
          email: "hello@thesibook.gr",
          description:
            "Πλατφόρμα online κρατήσεων για σεμινάρια, workshops και εκπαιδευτικές επιχειρήσεις στην Ελλάδα.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <ForBusinesses />
        <HowItWorks />
        <AppPreview />
        <Benefits />
        <EarlyAccess />
        <FAQ />
      </main>
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </div>
  );
}
