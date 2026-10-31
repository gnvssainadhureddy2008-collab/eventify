import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, CalendarDays, MapPin, Trash2, ArrowRight, Users } from "lucide-react";
import CategoryImage from "@/components/event/CategoryImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { asItems, formatINR, formatShortDate, planningProgress, daysUntil } from "@/lib/format";
import { displayType } from "@/lib/eventTypes";

export const Route = createFileRoute("/_authed/events/")({
  head: () => ({ meta: [{ title: "My Events — Aurelia" }] }),
  component: MyEventsPage,
});

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Event.list("-created_date", 100)
      .then((page) => !cancelled && setEvents(asItems(page)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    await base44.entities.Invitation.deleteMany({ event_id: target.id });
    await base44.entities.Event.delete(target.id);
    setEvents((prev) => prev.filter((e) => e.id !== target.id));
    toast.success("Event deleted");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My events</p>
          <h1 className="mt-2 text-[30px] leading-tight text-primary sm:text-[40px]">Celebrations in motion</h1>
        </div>
        <Link
          to="/plan"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[13px] text-primary-foreground transition-all hover:shadow-[0_18px_36px_-20px_hsl(320_27%_20%)]"
        >
          <Plus className="h-4 w-4" /> Create another event
        </Link>
      </div>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="mt-10 rounded-[2rem] border border-dashed border-border px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-6 w-6 text-accent" />
          <h2 className="mt-4 text-[22px] text-primary">No events yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Start with an event type, a date and a budget — your plan, venues and invitations follow from there.
          </p>
          <Link
            to="/plan"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
          >
            Create your first event <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => {
          const progress = planningProgress(event);
          const days = daysUntil(event.date);
          return (
            <article
              key={event.id}
              className="group overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_50px_-38px_hsl(320_25%_20%)] animate-rise"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <Link to="/events/$eventId" params={{ eventId: event.id }} className="block">
                <div className="relative h-[160px] overflow-hidden">
                  <CategoryImage
                    src={event.cover_image}
                    eventType={event.event_type}
                    alt={`${event.name} — ${displayType(event)}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(320_25%_14%/0.6)] to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/18 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
                    {displayType(event)}
                  </span>
                  {days != null && days >= 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] text-primary">
                      {days === 0 ? "Today" : `${days}d`}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <Link to="/events/$eventId" params={{ eventId: event.id }}>
                  <h3 className="truncate text-[19px] leading-tight text-primary">{event.name}</h3>
                </Link>
                <div className="mt-2 space-y-1 text-[11.5px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" /> {formatShortDate(event.date)}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" /> {event.venue_name || event.location_label || "Location to confirm"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> {event.guest_count || "—"} guests · {formatINR(event.budget)}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>Planning</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: event.id }}
                    className="inline-flex items-center gap-1 text-[12px] text-primary transition-colors hover:text-[hsl(40_40%_42%)]"
                  >
                    Open plan <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(event)}
                    aria-label={`Delete ${event.name}`}
                    className="text-muted-foreground/50 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Its plan, venue and invitations will be removed, and it disappears from your calendar. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}