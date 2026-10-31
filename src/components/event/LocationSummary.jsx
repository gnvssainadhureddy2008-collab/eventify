import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";

const VenueMap = lazy(() => import("@/components/map/VenueMap"));

export default function LocationSummary({ event, onDiscover }) {
  const area = { lat: event.location_lat, lng: event.location_lng };
  const venue = event.venue_id
    ? { id: event.venue_id, name: event.venue_name, address: event.venue_address, lat: event.venue_lat, lng: event.venue_lng }
    : null;

  return (
    <div className="card-soft overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-[17px] text-primary">Location</h3>
        <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          {event.venue_name
            ? `${event.venue_name}${event.venue_address ? ` — ${event.venue_address}` : ""}`
            : event.location_address || event.location_label || "Area to be confirmed"}
        </p>
      </div>

      {typeof area.lat === "number" ? (
        <ClientOnly fallback={<div className="h-[170px] animate-pulse bg-muted" />}>
          <Suspense fallback={<div className="h-[170px] animate-pulse bg-muted" />}>
            <VenueMap venues={venue ? [venue] : []} area={area} height={170} />
          </Suspense>
        </ClientOnly>
      ) : (
        <div className="mx-5 mb-4 rounded-xl bg-secondary/60 px-4 py-6 text-center text-[12px] text-muted-foreground">
          No pin on the map yet — edit the event details to add one.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3.5">
        <button
          type="button"
          onClick={onDiscover}
          className="inline-flex items-center gap-1.5 text-[12px] text-primary transition-colors hover:text-[hsl(40_40%_42%)]"
        >
          <Navigation className="h-3.5 w-3.5" /> Discover venues nearby
        </button>
        {event.venue_maps_url && (
          <a
            href={event.venue_maps_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11.5px] text-muted-foreground hover:text-primary"
          >
            Directions
          </a>
        )}
      </div>
    </div>
  );
}