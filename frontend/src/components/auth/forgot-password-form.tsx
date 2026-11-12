"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Δεν ήταν δυνατή η αποστολή");
        return;
      }
      setMessage(
        data.message ??
          "Αν υπάρχει λογαριασμός με αυτό το email, στάλθηκε σύνδεσμος επαναφοράς.",
      );
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
          <h1 className="text-2xl font-bold">Επαναφορά κωδικού</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Στείλε έναν σύνδεσμο στο email του λογαριασμού σου.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-foreground">{message}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Αποστολή…" : "Αποστολή συνδέσμου"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary">
              Επιστροφή στη σύνδεση
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
