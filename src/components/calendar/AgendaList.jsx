import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Bell } from "lucide-react";
import { formatLongDate, formatINR, daysUntil } from "@/lib/format";
import { displayType } from "@/lib/eventTypes";

export default function AgendaList({ events, onEmptyDay }) {
  const upcoming = [...events].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (!upcoming.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-accent" />
        <p className="mt-3 text-[16px] text-primary">Nothing on the calendar yet</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Create an event and it will appear here.</p>
        <button
          type="button"
          onClick={() => onEmptyDay(new Date().toISOString().slice(0, 10))}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
        >
          Create an event
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {upcoming.map((e) => {
        const days = daysUntil(e.date);
        return (
          <li key={e.id}>
            <Link
              to="/events/$eventId"
              params={{ eventId: e.id }}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3.5 transition-all hover:border-accent/50 hover:shadow-[0_16px_32px_-30px_hsl(320_25%_20%)]"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {new Date(`${e.date}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}
                </span>
                <span className="serif-display text-[17px] leading-none text-primary">
                  {new Date(`${e.date}T00:00:00`).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-primary">{e.name}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {displayType(e)} · {formatLongDate(e.date)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" /> {e.venue_name || e.location_label || "Location to confirm"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] text-primary">{formatINR(e.budget)}</p>
                <p className="text-[10.5px] text-muted-foreground">
                  {days > 0 ? `in ${days}d` : days === 0 ? "today" : "past"}
                </p>
                {e.reminder_enabled && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[hsl(40_40%_40%)]">
                    <Bell className="h-2.5 w-2.5" /> reminder
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}