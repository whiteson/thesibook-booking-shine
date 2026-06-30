"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EarlyAccessSection } from "@/types/cms";

type Props = {
  section: EarlyAccessSection;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function EarlyAccessSectionView({ section }: Props) {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      company: String(formData.get("company") ?? ""),
      businessType: String(formData.get("businessType") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="early-access" className="relative overflow-hidden bg-gradient-soft py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elegant md:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-brand opacity-15 blur-3xl" aria-hidden />
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {section.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{section.description}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {section.benefits.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary-soft" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/50 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{section.successTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {section.successDescription}
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Δημιουργία λογαριασμού & booking →
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{section.form.nameLabel}</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder={section.form.namePlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{section.form.emailLabel}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={section.form.emailPlaceholder}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">{section.form.phoneLabel}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder={section.form.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company">{section.form.companyLabel}</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder={section.form.companyPlaceholder}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessType">
                    {section.form.businessTypeLabel}
                  </Label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    defaultValue=""
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      {section.form.businessTypePlaceholder}
                    </option>
                    {section.businessTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">{section.form.messageLabel}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder={section.form.messagePlaceholder}
                  />
                </div>
                {status === "error" ? (
                  <p className="text-sm text-destructive">
                    {section.errorDescription}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  className="w-full bg-gradient-brand text-primary-foreground shadow-elegant"
                >
                  {section.submitLabel}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
