import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import MonthGrid from "@/components/calendar/MonthGrid";
import WeekView from "@/components/calendar/WeekView";
import AgendaList from "@/components/calendar/AgendaList";
import ReminderCard from "@/components/calendar/ReminderCard";
import { asItems } from "@/lib/format";

export const Route = createFileRoute("/_authed/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Aurelia" }] }),
  component: CalendarPage,
});

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "agenda", label: "Agenda" },
];

function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    base44.entities.Event.list("-date", 200)
      .then((page) => !cancelled && setEvents(asItems(page)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function shift(direction) {
    setAnchor((prev) => {
      const next = new Date(prev);
      if (view === "week") next.setDate(next.getDate() + direction * 7);
      else next.setMonth(next.getMonth() + direction);
      return next;
    });
  }

  function createOn(dateKey) {
    navigate({ to: "/plan", search: { date: dateKey } });
  }

  const weekStart = new Date(anchor);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const title =
    view === "week"
      ? `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : anchor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1 className="mt-2 text-[30px] leading-tight text-primary sm:text-[40px]">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            className="rounded-full border border-border px-3.5 py-2 text-[12px] text-primary transition-colors hover:border-accent/60"
          >
            Today
          </button>
          <div className="flex overflow-hidden rounded-full border border-border">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Previous"
              className="px-2.5 py-2 text-primary transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Next"
              className="border-l border-border px-2.5 py-2 text-primary transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => createOn(new Date().toISOString().slice(0, 10))}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Event
          </button>
        </div>
      </div>

      <div className="mt-6 flex w-fit gap-1 rounded-full bg-secondary/70 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] transition-colors ${
              view === v.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="h-[420px] animate-pulse rounded-3xl bg-muted" />
        ) : view === "month" ? (
          <MonthGrid month={anchor} events={events} onEmptyDay={createOn} />
        ) : view === "week" ? (
          <WeekView anchor={anchor} events={events} onEmptyDay={createOn} />
        ) : (
          <AgendaList events={events} onEmptyDay={createOn} />
        )}
      </div>

      <p className="mt-4 text-[11.5px] text-muted-foreground">
        Click any event to open its plan. Use the + on a date to start a new event on that day.
      </p>

      <ReminderCard />
    </div>
  );
}