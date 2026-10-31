import { Link } from "@tanstack/react-router";
import { toDateKey, formatTime } from "@/lib/format";
import { displayType } from "@/lib/eventTypes";

export default function WeekView({ anchor, events, onEmptyDay }) {
  const start = new Date(anchor);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const today = toDateKey(new Date());

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-7">
      {days.map((day) => {
        const key = toDateKey(day);
        const dayEvents = events.filter((e) => e.date === key);
        return (
          <div
            key={key}
            className={`rounded-2xl border p-3 ${
              key === today ? "border-accent/60 bg-accent/6" : "border-border/70 bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1.5 sm:block">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {day.toLocaleDateString("en-IN", { weekday: "short" })}
                </p>
                <p className="serif-display text-[17px] leading-none text-primary sm:mt-0 sm:text-[22px] sm:leading-tight">
                  {day.getDate()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEmptyDay(key)}
                aria-label={`Create an event on ${key}`}
                className="px-2 py-1 text-[16px] leading-none text-muted-foreground/50 transition-colors hover:text-accent"
              >
                +
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {dayEvents.map((e) => (
                <Link
                  key={e.id}
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="block rounded-lg bg-secondary/70 px-2 py-1.5 transition-colors hover:bg-secondary"
                >
                  <span className="block truncate text-[11.5px] text-primary">{e.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {formatTime(e.start_time) || displayType(e)}
                  </span>
                </Link>
              ))}
              {dayEvents.length === 0 && <p className="text-[10.5px] text-muted-foreground/60">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}