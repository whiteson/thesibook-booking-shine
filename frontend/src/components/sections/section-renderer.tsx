import { AppPreviewSectionView } from "@/components/sections/app-preview-section";
import { ContactCardsSectionView } from "@/components/sections/contact-cards-section";
import { EarlyAccessSectionView } from "@/components/sections/early-access-section";
import { FaqSectionView } from "@/components/sections/faq-section";
import { ForBusinessesSectionView } from "@/components/sections/for-businesses-section";
import { HeroSectionView } from "@/components/sections/hero-section";
import { IconGridSectionView } from "@/components/sections/icon-grid-section";
import { PageHeroSectionView } from "@/components/sections/page-hero-section";
import { SolutionSectionView } from "@/components/sections/solution-section";
import { StepsSectionView } from "@/components/sections/steps-section";
import { UnknownSectionView } from "@/components/sections/unknown-section";
import type { PageSection } from "@/types/cms";

type Props = {
  sections: PageSection[];
};

export function SectionRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.type}-${index}`;

        switch (section.type) {
          case "page_hero":
            return <PageHeroSectionView key={key} section={section} />;
          case "hero":
            return <HeroSectionView key={key} section={section} />;
          case "icon_grid":
            return <IconGridSectionView key={key} section={section} />;
          case "solution":
            return <SolutionSectionView key={key} section={section} />;
          case "for_businesses":
            return <ForBusinessesSectionView key={key} section={section} />;
          case "steps":
            return <StepsSectionView key={key} section={section} />;
          case "app_preview":
            return <AppPreviewSectionView key={key} section={section} />;
          case "early_access":
            return <EarlyAccessSectionView key={key} section={section} />;
          case "faq":
            return <FaqSectionView key={key} section={section} />;
          case "contact_cards":
            return <ContactCardsSectionView key={key} section={section} />;
          case "unknown":
            return <UnknownSectionView key={key} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
