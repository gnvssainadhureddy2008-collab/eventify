import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Plus, Mail, LayoutGrid } from "lucide-react";

const ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Events", to: "/events", icon: LayoutGrid },
  { label: "Plan", to: "/plan", icon: Plus, raised: true },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Invites", to: "/invitations", icon: Mail },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ label, to, icon: Icon, raised }) => {
          const active = isActive(to);
          if (raised) {
            return (
              <Link
                key={to}
                to={to}
                aria-label="Create an event"
                className="flex flex-1 flex-col items-center gap-1 pt-1 text-[10px] text-primary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_22px_-14px_hsl(320_27%_24%)]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? "text-accent" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}