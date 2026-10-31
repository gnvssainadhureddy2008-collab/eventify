import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Plus, Sparkles } from "lucide-react";
import AccountMenu from "@/components/layout/AccountMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileTabBar from "@/components/layout/MobileTabBar";
import AssistantChat from "@/components/assistant/AssistantChat";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Plan an Event", to: "/plan" },
  { label: "My Events", to: "/events" },
  { label: "Calendar", to: "/calendar" },
  { label: "My Invitations", to: "/invitations" },
];

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="min-h-screen bg-background pb-[68px] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="group flex items-baseline gap-2.5">
            <span className="serif-display text-[26px] leading-none tracking-tight text-primary">Aurelia</span>
            <span className="hidden text-[10px] uppercase tracking-[0.34em] text-muted-foreground sm:block">
              Celebrations
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-300 ${
                  isActive(item.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
                {isActive(item.to) && (
                  <span className="absolute inset-x-3.5 -bottom-px h-px bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/plan"
              className="group hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_10px_24px_-14px_hsl(320_27%_24%)] sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Event
            </Link>
            <ThemeToggle />
            <span className="hidden lg:block">
              <AccountMenu />
            </span>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-primary lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border/60 bg-card px-5 pb-5 pt-3 lg:hidden">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between border-b border-border/50 py-3 text-sm ${
                    isActive(item.to) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                  <Sparkles className={`h-3.5 w-3.5 ${isActive(item.to) ? "text-accent" : "opacity-0"}`} />
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link
                to="/plan"
                onClick={() => setOpen(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Create Event
              </Link>
              <ThemeToggle className="h-11 w-11" />
              <AccountMenu className="h-11 w-11" />
            </div>
            {user?.email && (
              <p className="mt-3 truncate text-[11px] text-muted-foreground">{user.email}</p>
            )}
          </div>
        )}
      </header>

      <main>{children}</main>

      <MobileTabBar />
      <AssistantChat />

      <footer className="mt-20 border-t border-border/60 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="serif-display text-lg text-primary">Aurelia</p>
          <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
            Plans, budgets and checklists are thoughtful estimates, not quotations. Venue details come from live
            map data when configured.
          </p>
        </div>
      </footer>
    </div>
  );
}