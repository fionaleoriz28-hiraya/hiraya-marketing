import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hiraya Marketing" },
      { name: "description", content: "Sign in or create a Hiraya Marketing account to audit your brand, plan content and track growth." },
      { property: "og:title", content: "Sign in — Hiraya Marketing" },
      { property: "og:description", content: "Your small business marketing workspace: audits, content plans, strategy and ads." },
      { property: "og:image", content: "/hiraya-logo.svg" },
      { property: "og:image:alt", content: "Hiraya Marketing — From Vision to Visibility" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth/callback" });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/profile" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center text-center">
          <img src="/hiraya-logo.svg" alt="Hiraya Marketing" className="mb-3 h-28 w-28 object-contain sm:h-32 sm:w-32" />
          <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">From vision to visibility</span>
        </Link>

        <div className="card-soft p-6 sm:p-8">
          {checkEmail ? (
            <div className="space-y-4 text-center">
              <h1 className="font-display text-xl font-semibold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>.
                Click it to finish creating your account, then come back and sign in.
              </p>
              <Button variant="secondary" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to your marketing workspace." : "Start with a free brand awareness audit."}</p>
              <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={handleGoogle}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M21.35 11.1H12v2.95h5.35c-.23 1.4-1.64 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.25 12 6.25c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.89 2.75 2.75 6.89 2.75 12S6.89 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.11z" /></svg>
                Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use email<span className="h-px flex-1 bg-border" /></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Your name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Maria Santos" required />
                  </div>
                )}
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" required /></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
              </form>
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-5 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
                {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
