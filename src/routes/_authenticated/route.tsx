import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BarChart3,
  CalendarDays,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  Store,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsAgent } from "@/lib/chat";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/audit", label: "Audit", icon: Search },
  { to: "/engagement", label: "Engagement", icon: Heart },
  { to: "/growth", label: "Growth", icon: BarChart3 },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/strategy", label: "Strategy & Ads", icon: Compass },
  { to: "/assistant", label: "Assistant", icon: MessageCircle },
  { to: "/profile", label: "Business", icon: Store },
] as const;

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const { data: isAgent } = useIsAgent();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const visibleNav = isAgent ? [...nav, { to: "/agent" as const, label: "Live Agent", icon: MessageCircle }] : nav;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar px-4 py-6 lg:block">
        <Link to="/dashboard" className="block px-2">
          <span className="font-display text-lg font-semibold">Hiraya</span>
          <span className="ml-1 font-display text-lg font-light text-primary">Marketing</span>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            From vision to visibility
          </p>
        </Link>
        <nav className="mt-8 space-y-1">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="mt-8 w-full justify-start text-muted-foreground"
          onClick={() => signOut().then(() => navigate({ to: "/" }))}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      <div className="flex-1 pb-24 lg:pb-0">
        <header className="flex items-center justify-between border-b border-border px-5 py-4 lg:hidden">
          <Link to="/dashboard">
            <span className="font-display text-base font-semibold">Hiraya</span>
            <span className="ml-1 font-display text-base font-light text-primary">Marketing</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
          >
            <LogOut className="size-4" />
          </Button>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="flex overflow-x-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 px-2 py-3 text-[10px]",
                pathname === item.to ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
