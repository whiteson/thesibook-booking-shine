"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Σφάλμα σύνδεσης");
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
          <h1 className="text-2xl font-bold">Σύνδεση</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Κωδικός</Label>
              <Input id="password" name="password" type="password" required className="mt-1.5" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Σύνδεση…" : "Σύνδεση"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Νέος χρήστης;{" "}
            <Link href="/register" className="font-medium text-primary">
              Εγγραφή
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
