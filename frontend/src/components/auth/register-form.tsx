"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS } from "@/types/booking";

function slugPreview(company: string) {
  return company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          companyName: fd.get("companyName"),
          slug: fd.get("slug") || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Σφάλμα εγγραφής");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Δικτυακό σφάλμα — δοκιμάστε ξανά");
    } finally {
      setLoading(false);
    }
  }

  const preview = slugPreview(company);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-sm font-semibold text-primary">
          ← ThesiBook
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h1 className="text-2xl font-bold tracking-tight">Δημιουργία λογαριασμού</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Εγγραφή + αυτόματο booking workspace για την επιχείρησή σας.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="name">Ονοματεπώνυμο</Label>
              <Input id="name" name="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Κωδικός (min 8)</Label>
              <Input id="password" name="password" type="password" minLength={8} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="companyName">Όνομα επιχείρησης</Label>
              <Input
                id="companyName"
                name="companyName"
                required
                className="mt-1.5"
                onChange={(ev) => setCompany(ev.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="slug">URL workspace (προαιρετικό)</Label>
              <Input id="slug" name="slug" placeholder={preview || "my-business"} className="mt-1.5" />
              {preview ? (
                <p className="mt-1 text-xs text-muted-foreground">thesibook.gr/book/{preview}</p>
              ) : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Δημιουργία workspace…" : "Εγγραφή & ξεκίνα booking"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Έχετε λογαριασμό;{" "}
            <Link href="/login" className="font-medium text-primary">
              Σύνδεση
            </Link>
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card/80 p-4 text-center text-sm">
              <p className="font-semibold">{p.nameEl}</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {p.priceEur === 0 ? "€0" : `€${p.priceEur}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.maxAttendants === null ? "Απεριόριστοι" : `έως ${p.maxAttendants} κρατήσεις`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
