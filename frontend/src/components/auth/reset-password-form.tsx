"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Οι κωδικοί δεν ταιριάζουν");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Η επαναφορά απέτυχε");
        return;
      }
      router.push("/login");
    } catch {
      setError("Δικτυακό σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-sm font-semibold text-primary">
          ← ThesiBook
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Νέος κωδικός</h1>
          {!token ? (
            <p className="mt-4 text-sm text-destructive">
              Λείπει ο σύνδεσμος επαναφοράς. Ζήτησε νέο από τη σελίδα σύνδεσης.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="password">Νέος κωδικός</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="confirm">Επιβεβαίωση</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  minLength={8}
                  required
                  className="mt-1.5"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Αποθήκευση…" : "Αποθήκευση κωδικού"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary">
              Σύνδεση
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
