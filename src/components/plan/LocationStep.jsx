import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, MapPin, Crosshair, Loader2, AlertCircle } from "lucide-react";
import { searchLocation } from "@/lib/server-fns";
import { displayType, typeMeta } from "@/lib/eventTypes";
import { formatINR, formatLongDate, formatTime } from "@/lib/format";

const LocationPicker = lazy(() => import("@/components/map/LocationPicker"));

export default function LocationStep({ form, set, errors, onConfirm, saving }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [note, setNote] = useState("");
  const runSearch = useServerFn(searchLocation);

  async function doSearch(e) {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setStatus("searching");
    setNote("");
    try {
      const res = await runSearch({ data: { query: query.trim() } });
      if (!res.configured) {
        setStatus("unconfigured");
        setResults([]);
        return;
      }
      if (res.error) {
        setStatus("error");
        setNote(res.error);
        return;
      }
      setResults(res.places || []);
      setStatus((res.places || []).length ? "done" : "empty");
    } catch {
      setStatus("error");
      setNote("The location search could not be reached. You can still drop a pin and type the area.");
    }
  }

  function pick(place) {
    set({
      location_label: place.name,
      location_address: place.address,
      location_lat: place.lat,
      location_lng: place.lng,
    });
    setResults([]);
    setStatus("idle");
    setQuery(place.name);
  }

  function onMapPick(lat, lng) {
    set({
      location_lat: lat,
      location_lng: lng,
      location_label: form.location_label || "Dropped pin",
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setNote("This browser cannot share your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          location_lat: pos.coords.latitude,
          location_lng: pos.coords.longitude,
          location_label: form.location_label || "Current location",
        });
        setNote("Using your current location — confirm the address below.");
      },
      () => setNote("Location permission was not granted. Drop a pin on the map instead."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const hasPin = typeof form.location_lat === "number" && typeof form.location_lng === "number";

  return (
    <div>
      <h2 className="text-[26px] leading-tight text-primary sm:text-[30px]">Where is it happening?</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        A city, locality or venue is enough for now — you can choose the exact venue in the next step.
      </p>

      <form onSubmit={doSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city, locality, address or venue"
            aria-label="Search for a location"
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <button
          type="submit"
          disabled={status === "searching" || query.trim().length < 2}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          {status === "searching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {(status === "unconfigured" || status === "error") && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent/40 bg-accent/8 px-4 py-3 text-[12.5px] leading-relaxed text-primary">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(40_45%_42%)]" />
          <span>
            {status === "unconfigured" ? (
              <>
                Address search needs a Google Maps key to be connected. Meanwhile, click the map below to drop your
                pin and type the area name — everything else works normally.
              </>
            ) : (
              note
            )}
          </span>
        </div>
      )}

      {status === "empty" && (
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          No match for that search. Try a nearby city or drop a pin directly on the map.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card animate-rise">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  <span className="block text-[13.5px] text-primary">{p.name}</span>
                  <span className="block text-[12px] text-muted-foreground">{p.address}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          Click the map to drop a pin, then drag it to fine-tune.
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] text-primary transition-colors hover:border-accent/60"
        >
          <Crosshair className="h-3.5 w-3.5" /> Use my current location
        </button>
      </div>

      <div className="mt-4">
        <ClientOnly fallback={<div className="h-[340px] animate-pulse rounded-2xl bg-muted" />}>
          <Suspense fallback={<div className="h-[340px] animate-pulse rounded-2xl bg-muted" />}>
            <LocationPicker lat={form.location_lat} lng={form.location_lng} onChange={onMapPick} height={340} />
          </Suspense>
        </ClientOnly>
      </div>

      {note && <p className="mt-2 text-[12px] text-muted-foreground">{note}</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="loc-label" className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Area or locality
          </label>
          <input
            id="loc-label"
            value={form.location_label}
            onChange={(e) => set({ location_label: e.target.value })}
            placeholder="Koramangala, Bengaluru"
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <div>
          <label htmlFor="loc-addr" className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Full address (optional)
          </label>
          <input
            id="loc-addr"
            value={form.location_address}
            onChange={(e) => set({ location_address: e.target.value })}
            placeholder="Street, landmark, city"
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
      </div>
      {errors.location && <p className="mt-2 text-[11.5px] text-destructive">{errors.location}</p>}

      <div className="mt-7 rounded-2xl border border-border/70 bg-secondary/40 p-5">
        <p className="eyebrow">Summary</p>
        <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Event</dt>
            <dd className="text-right text-primary">{form.name || "Untitled event"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="text-right text-primary">{displayType(form)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right text-primary">{formatLongDate(form.date)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Time</dt>
            <dd className="text-right text-primary">
              {form.start_time ? `${formatTime(form.start_time)}${form.end_time ? ` – ${formatTime(form.end_time)}` : ""}` : "Not set"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="text-right text-primary">{form.guest_count || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
            <dt className="text-muted-foreground">Budget</dt>
            <dd className="text-right text-primary">{form.budget ? formatINR(form.budget) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 sm:col-span-2">
            <dt className="text-muted-foreground">Location</dt>
            <dd className="text-right text-primary">
              {form.location_label || form.location_address || "Not selected"}
              {hasPin ? ` · ${form.location_lat.toFixed(3)}, ${form.location_lng.toFixed(3)}` : ""}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm text-primary-foreground transition-all hover:shadow-[0_18px_36px_-20px_hsl(320_27%_20%)] disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Creating your event…" : "Confirm Event Details"}
        </button>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          We use the {typeMeta(form.event_type).label.toLowerCase()} style of planning for this event. Amounts that
          follow are estimates, not quotations.
        </p>
      </div>
    </div>
  );
}