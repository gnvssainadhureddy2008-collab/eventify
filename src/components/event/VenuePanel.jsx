import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Search, Star, Phone, Globe, Navigation, Loader2, AlertCircle, Check, Heart, Scale, Crosshair } from "lucide-react";
import { searchVenues } from "@/lib/server-fns";
import { haversineKm } from "@/lib/format";

export default function VenuePanel({ event, onSelectVenue, onToggleFavourite, onSetArea }) {
  const runSearch = useServerFn(searchVenues);
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [compare, setCompare] = useState([]);

  const area = { lat: event.location_lat, lng: event.location_lng };
  const favourites = event.saved_venues || [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const res = await runSearch({ data: { eventId: event.id } });
        if (cancelled) return;
        if (!res.configured) {
          setStatus("unconfigured");
          return;
        }
        if (res.error) {
          setStatus("error");
          setMessage(res.error);
          return;
        }
        setPlaces(res.places || []);
        setStatus((res.places || []).length ? "done" : "empty");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("The venue search could not be reached. Please try again in a moment.");
        }
      }
    }
    if (typeof area.lat === "number") load();
    else setStatus("nolocation");
    return () => {
      cancelled = true;
    };
  }, [event.id, event.location_lat, event.location_lng]);

  async function search(e) {
    e?.preventDefault();
    setStatus("loading");
    try {
      const res = await runSearch({ data: { eventId: event.id, keyword: keyword.trim() || undefined } });
      if (!res.configured) {
        setStatus("unconfigured");
        return;
      }
      if (res.error) {
        setStatus("error");
        setMessage(res.error);
        return;
      }
      setPlaces(res.places || []);
      setStatus((res.places || []).length ? "done" : "empty");
    } catch {
      setStatus("error");
      setMessage("The venue search could not be reached. Please try again in a moment.");
    }
  }

  function toggleCompare(v) {
    setCompare((prev) =>
      prev.some((p) => p.id === v.id) ? prev.filter((p) => p.id !== v.id) : prev.length >= 3 ? prev : [...prev, v],
    );
  }

  if (status === "nolocation") {
    return (
      <div className="card-soft p-6">
        <h3 className="text-[19px] text-primary">Venue discovery</h3>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          We search venues around a point on the map. Drop a pin for this event, or set the area from where you are
          right now.
        </p>
        <button
          type="button"
          onClick={onSetArea}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] text-primary-foreground"
        >
          <Crosshair className="h-3.5 w-3.5" /> Set the area from my location
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {favourites.length > 0 && (
        <div className="card-soft p-5">
          <h3 className="text-[17px] text-primary">Saved venues</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {favourites.map((v) => (
              <li key={v.id} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-primary">{v.name}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{v.address}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectVenue(v)}
                    className="rounded-full bg-primary px-2.5 py-1 text-[10.5px] text-primary-foreground"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavourite(v)}
                    aria-label={`Remove ${v.name} from favourites`}
                    className="text-muted-foreground/60 hover:text-destructive"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-soft p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[19px] text-primary">Venues near your area</h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {event.location_label || event.location_address || "Selected area"} · live map data
            </p>
          </div>
          <form onSubmit={search} className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Banquet hall, garden…"
              aria-label="Venue keyword"
              className="w-36 rounded-xl border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus:border-accent sm:w-44"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[12px] text-primary-foreground"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </form>
        </div>

        {status === "loading" && (
          <div className="mt-5 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching real venues around your area…
          </div>
        )}

        {status === "unconfigured" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent/8 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(40_45%_42%)]" />
            <div className="text-[12.5px] leading-relaxed text-primary">
              <p className="font-medium">Live venue search needs a map key.</p>
              <p className="mt-1 text-muted-foreground">
                Add a Google Maps Platform key in the app settings to see real venues with ratings, phone numbers and
                directions. Until then, keep planning with your general area — your budget, timeline and invitation
                all work as normal.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12.5px] text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
          </div>
        )}

        {status === "empty" && (
          <div className="mt-4 rounded-xl bg-secondary/60 px-4 py-3.5 text-[12.5px] leading-relaxed text-muted-foreground">
            No venues matched this search. Try a broader keyword or a wider area — you can also continue with your
            general location for now.
          </div>
        )}

        {compare.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[520px] text-left text-[12px]">
              <thead className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Venue</th>
                  <th className="px-3 py-2">Rating</th>
                  <th className="px-3 py-2">Distance</th>
                  <th className="px-3 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((v) => (
                  <tr key={v.id} className="border-t border-border/60">
                    <td className="px-3 py-2 text-primary">{v.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{v.rating ? `${v.rating} ★` : "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {haversineKm(area, v) != null ? `${haversineKm(area, v)} km` : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{v.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {places.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {places.map((v) => {
              const selected = event.venue_id === v.id;
              const distance = haversineKm(area, v);
              return (
                <li
                  key={v.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    selected ? "border-accent bg-accent/6" : "border-border/70 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-primary">{v.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{v.address}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleFavourite(v)}
                      aria-label={favourites.some((f) => f.id === v.id) ? "Remove favourite" : "Save favourite"}
                      className={`shrink-0 transition-colors ${
                        favourites.some((f) => f.id === v.id) ? "text-[hsl(6_44%_60%)]" : "text-muted-foreground/40"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${favourites.some((f) => f.id === v.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {v.rating != null && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Star className="h-3 w-3 fill-accent text-accent" /> {v.rating}
                        {v.reviews != null && <span className="text-muted-foreground">({v.reviews})</span>}
                      </span>
                    )}
                    {distance != null && <span>{distance} km away</span>}
                    {v.kind && <span>{v.kind}</span>}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectVenue(v)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                        selected
                          ? "bg-accent/25 text-primary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {selected ? <Check className="h-3 w-3" /> : null}
                      {selected ? "Selected venue" : "Select venue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompare(v)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] text-primary hover:border-accent/60"
                    >
                      <Scale className="h-3 w-3" /> {compare.some((c) => c.id === v.id) ? "Comparing" : "Compare"}
                    </button>
                    {v.phone && (
                      <a
                        href={`tel:${v.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11px] text-primary hover:border-accent/60"
                      >
                        <Phone className="h-3 w-3" /> Call
                      </a>
                    )}
                    {v.website && (
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11px] text-primary hover:border-accent/60"
                      >
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    )}
                    <a
                      href={v.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11px] text-primary hover:border-accent/60"
                    >
                      <Navigation className="h-3 w-3" /> Directions
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          Venue details come from live map listings. Availability on your date is not verified — always confirm
          directly with the venue.
        </p>
      </div>
    </div>
  );
}