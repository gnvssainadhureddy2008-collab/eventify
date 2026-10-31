import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil, Trash2, CalendarDays, Clock, Users, MapPin, Sparkles, Star } from "lucide-react";
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
import CategoryImage from "@/components/event/CategoryImage";
import { formatINR, formatLongDate, formatTime, daysUntil, planningProgress } from "@/lib/format";
import { displayType } from "@/lib/eventTypes";

export default function EventHeader({ event, onEdit, onDelete, onRegenerate, regenerating }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const progress = planningProgress(event);
  const days = daysUntil(event.date);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card">
      <div className="relative h-[220px] sm:h-[280px]">
        <CategoryImage
          src={event.cover_image}
          eventType={event.event_type}
          alt={`${event.name} celebration`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(320_25%_14%/0.82)] via-[hsl(320_25%_14%/0.35)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10.5px] uppercase tracking-[0.2em] text-white/90 backdrop-blur">
            {displayType(event)}
          </span>
          <h1 className="mt-3 text-[30px] leading-tight text-white sm:text-[40px]">{event.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {formatLongDate(event.date)}
            </span>
            {event.start_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {formatTime(event.start_time)}
                {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {event.guest_count || "—"} guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {event.venue_name || event.location_label || "Location to confirm"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Budget</p>
            <p className="serif-display text-[19px] text-primary">{formatINR(event.budget)}</p>
          </div>
          <div className="min-w-[130px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Planning progress
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-[3px] w-20 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11.5px] text-primary">{progress}%</span>
            </div>
          </div>
          {days != null && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground">
              {days > 0 ? `${days} day${days === 1 ? "" : "s"} to go` : days === 0 ? "Today" : "Completed"}
            </span>
          )}
          {event.venue_name && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" /> {event.venue_name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {event.plan && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] text-primary transition-colors hover:border-accent/60 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" /> {regenerating ? "Regenerating…" : "Regenerate plan"}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] text-primary transition-colors hover:border-accent/60"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit details
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{event.name}” and its plan will be removed from your events and calendar. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}