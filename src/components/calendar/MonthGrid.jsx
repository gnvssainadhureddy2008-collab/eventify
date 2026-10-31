import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { toDateKey, formatTime } from "@/lib/format";
import { displayType } from "@/lib/eventTypes";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthGrid({ month, events, onEmptyDay }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(year, m, 1 - startOffset);
  const today = toDateKey(new Date());

  const byDate = events.reduce((acc, e) => {
    if (!e.date) return acc;
    acc[e.date] = acc[e.date] || [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  // Phones get a scannable list of the month's events instead of seven
  // narrow columns where names cannot be read.
  const monthDays = Array.from({ length: new Date(year, m + 1, 0).getDate() }, (_, i) => new Date(year, m, i + 1));
  const monthRows = monthDays.flatMap((day) =>
    (byDate[toDateKey(day)] || []).map((e) => ({ key: `${toDateKey(day)}-${e.id}`, day, event: e })),
  );

  return (
    <>
      <div className="sm:hidden">
        {monthRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-[12.5px] leading-relaxed text-muted-foreground">
            Nothing scheduled this month. Use the Event button to start planning.
          </p>
        ) : (
          <ul className="space-y-2">
            {monthRows.map(({ key, day, event }) => (
              <li key={key}>
                <Link
                  to="/events/$eventId"
                  params={{ eventId: event.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2.5"
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                    <span className="text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                      {day.toLocaleDateString("en-IN", { weekday: "short" })}
                    </span>
                    <span className="serif-display text-[15px] leading-none text-primary">{day.getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-primary">{event.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {displayType(event)}
                      {event.start_time ? ` · ${formatTime(event.start_time)}` : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-border/70 bg-card sm:block">
        <div className="grid grid-cols-7 border-b border-border/60 bg-secondary/40">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = toDateKey(day);
            const inMonth = day.getMonth() === m;
            const dayEvents = byDate[key] || [];
            const isToday = key === today;
            return (
              <div
                key={key}
                className={`min-h-[92px] border-b border-r border-border/50 p-1.5 transition-colors last:border-r-0 ${
                  inMonth ? "bg-card" : "bg-secondary/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] ${
                      isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-primary" : "text-muted-foreground/50"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEmptyDay(key)}
                    aria-label={`Create an event on ${key}`}
                    className="px-1 text-[13px] leading-none text-muted-foreground/40 transition-colors hover:text-accent"
                  >
                    +
                  </button>
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((e) => (
                    <Link
                      key={e.id}
                      to="/events/$eventId"
                      params={{ eventId: e.id }}
                      className="block truncate rounded-md bg-accent/16 px-1.5 py-1 text-[10.5px] leading-tight text-[hsl(38_40%_28%)] transition-colors hover:bg-accent/28"
                    >
                      {e.name}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="block px-1.5 text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}