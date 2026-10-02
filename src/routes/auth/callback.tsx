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

    async function completeAuth() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const error = searchParams.get("error") ?? hashParams.get("error");
      const errorDescription =
        searchParams.get("error_description") ??
        hashParams.get("error_description");

      if (error) {
        const message = errorDescription || error || "Authentication could not be completed.";
        if (!cancelled) {
          setErrorMessage(message);
          toast.error(message);
        }
        return;
      }

      const code = searchParams.get("code");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let authError: { message: string } | null = null;

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        authError = exchangeError;
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        authError = sessionError;
      } else {
        authError = {
          message: "Authentication response is missing a code or session tokens.",
        };
      }

      if (cancelled) return;

      if (authError) {
        setErrorMessage(authError.message);
        toast.error(authError.message);
        return;
      }

      // Remove OAuth tokens/code from the address bar after the session is established.
      window.history.replaceState(
        {},
        document.title,
        window.location.origin + window.location.pathname,
      );

      navigate({ to: "/dashboard" });
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
        <div className="card-soft w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="font-display text-xl font-semibold">
            Sign-in couldn’t be completed
          </h1>
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
        <img
          src="/hiraya-logo.svg"
          alt="Hiraya Marketing"
          className="mx-auto mb-5 h-20 w-20 object-contain"
        />
        <h1 className="font-display text-xl font-semibold">Signing you in…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Completing your sign-in and opening your Hiraya workspace.
        </p>
      </div>
    </main>
  );
}
