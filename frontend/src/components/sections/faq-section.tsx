"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqSection } from "@/types/cms";
import { cn } from "@/lib/utils";

type Props = {
  section: FaqSection;
};

export function FaqSectionView({ section }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card px-5">
          {section.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between py-3 text-left text-base font-semibold"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="pb-3 text-sm text-muted-foreground">{item.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
