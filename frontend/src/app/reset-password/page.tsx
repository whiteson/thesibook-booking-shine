import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Νέος κωδικός | ThesiBook",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
          <p className="text-muted-foreground">Φόρτωση…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
