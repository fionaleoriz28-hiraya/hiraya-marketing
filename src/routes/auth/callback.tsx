import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorDescription = params.get("error_description");

      if (!code) {
        const message = errorDescription || "Google sign-in could not be completed.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }

      navigate({ to: "/dashboard" });
    }

    void completeOAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
        <div className="card-soft w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="font-display text-xl font-semibold">Sign-in couldn’t be completed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            className="mt-6 text-sm underline underline-offset-4"
            onClick={() => navigate({ to: "/auth" })}
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="card-soft w-full max-w-md p-6 text-center sm:p-8">
        <img src="/hiraya-logo.svg" alt="Hiraya Marketing" className="mx-auto mb-5 h-20 w-20 object-contain" />
        <h1 className="font-display text-xl font-semibold">Signing you in…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Completing your Google sign-in and opening your Hiraya workspace.
        </p>
      </div>
    </main>
  );
}
