import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EventHeader from "@/components/event/EventHeader";
import BudgetPanel from "@/components/event/BudgetPanel";
import TimelinePanel from "@/components/event/TimelinePanel";
import VendorPanel from "@/components/event/VendorPanel";
import IdeasPanel from "@/components/event/IdeasPanel";
import VenuePanel from "@/components/event/VenuePanel";
import CopilotPanel from "@/components/event/CopilotPanel";
import InvitationsTab from "@/components/event/InvitationsTab";
import LocationSummary from "@/components/event/LocationSummary";
import EditEventDialog from "@/components/event/EditEventDialog";
import GeneratingOverlay from "@/components/event/GeneratingOverlay";
import { generateEventPlan } from "@/lib/server-fns";
import { mergeProposal } from "@/lib/planMerge";

export const Route = createFileRoute("/_authed/events/$eventId")({
  head: () => ({ meta: [{ title: "Event plan — Aurelia" }] }),
  component: EventDetailPage,
});

const TABS = [
  { key: "plan", label: "Plan" },
  { key: "venues", label: "Venues" },
  { key: "copilot", label: "Copilot" },
  { key: "invitations", label: "Invitations" },
];

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.62 },
    colors: ["#C6A15B", "#D9A5A0", "#6E4A63", "#F2E8DA"],
    scalar: 0.9,
  });
}

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const generate = useServerFn(generateEventPlan);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("plan");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoTried = useRef(false);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Event.get(eventId)
      .then((e) => !cancelled && setEvent(e))
      .catch(() => !cancelled && setLoadError("This event could not be found, or it belongs to another account."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const patchEvent = useCallback(
    async (patch) => {
      const updated = await base44.entities.Event.update(eventId, patch);
      setEvent(updated);
      return updated;
    },
    [eventId],
  );

  const runGeneration = useCallback(async () => {
    setGenerating(true);
    setGenError("");
    try {
      const plan = await generate({ data: { eventId } });
      setEvent((prev) => (prev ? { ...prev, plan } : prev));
      toast.success("Your plan is ready");
      celebrate();
    } catch (err) {
      setGenError(err?.message || "The plan could not be generated. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [eventId, generate]);

  useEffect(() => {
    if (!event || event.plan || autoTried.current) return;
    autoTried.current = true;
    runGeneration();
  }, [event, runGeneration]);

  const updatePlanPart = async (partial) => {
    const plan = { ...(event.plan || {}), ...partial };
    setEvent((prev) => ({ ...prev, plan }));
    await base44.entities.Event.update(eventId, { plan });
  };

  const selectVenue = async (v) => {
    await patchEvent({
      venue_id: v.id,
      venue_name: v.name,
      venue_address: v.address,
      venue_phone: v.phone || "",
      venue_website: v.website || "",
      venue_rating: v.rating ?? undefined,
      venue_reviews: v.reviews ?? undefined,
      venue_lat: v.lat,
      venue_lng: v.lng,
      venue_maps_url: v.maps_url || "",
    });
    toast.success(`${v.name} saved as your venue`);
  };

  const toggleFavourite = async (v) => {
    const existing = event.saved_venues || [];
    const saved = existing.some((f) => f.id === v.id);
    await patchEvent({
      saved_venues: saved ? existing.filter((f) => f.id !== v.id) : [...existing, v],
    });
  };

  const setAreaFromDevice = () => {
    if (!navigator.geolocation) {
      toast.error("This browser cannot share your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await patchEvent({ location_lat: pos.coords.latitude, location_lng: pos.coords.longitude });
        toast.success("Area set from your location");
      },
      () => toast.error("Location permission was not granted. Add a pin while creating or editing the event."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const applyProposal = async (proposal) => {
    const merged = mergeProposal(event.plan, proposal, event.budget);
    const { _totalBudget, ...plan } = merged;
    await patchEvent({ plan });
    toast.success("Plan updated");
  };

  const deleteEvent = async () => {
    await base44.entities.Invitation.deleteMany({ event_id: eventId });
    await base44.entities.Event.delete(eventId);
    toast.success("Event deleted");
    navigate({ to: "/events" });
  };

  const saveDetails = async (values) => {
    setSaving(true);
    try {
      await patchEvent(values);
      setEditing(false);
      toast.success("Event updated");
    } catch (err) {
      toast.error(err?.message || "Could not save the changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="h-[280px] animate-pulse rounded-[2rem] bg-muted" />
        <div className="mt-5 h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-[28px] text-primary">Event not found</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">{loadError}</p>
        <Link
          to="/events"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to my events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <GeneratingOverlay active={generating} />

      <Link
        to="/events"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> My events
      </Link>

      <EventHeader
        event={event}
        onEdit={() => setEditing(true)}
        onDelete={deleteEvent}
        onRegenerate={runGeneration}
        regenerating={generating}
      />

      <div className="mt-6 -mx-5 flex gap-1 overflow-x-auto border-b border-border/60 px-5 pb-px [scrollbar-width:none] sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative shrink-0 whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors ${
              tab === t.key ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {genError && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
            <p className="text-[12.5px] text-destructive">{genError}</p>
            <button
              type="button"
              onClick={runGeneration}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        )}

        {tab === "plan" && (
          <div className="space-y-5">
            {!event.plan && !generating && !genError && (
              <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="text-[19px] text-primary">No plan yet</h3>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    Generate a budget, timeline, vendor checklist and ideas for this event.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runGeneration}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4" /> Generate plan
                </button>
              </div>
            )}

            {event.plan?.summary && (
              <div className="rounded-2xl border border-accent/30 bg-accent/6 px-5 py-4">
                <p className="eyebrow flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> The shape of this celebration
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-primary">{event.plan.summary}</p>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-5">
                <BudgetPanel event={event} />
                <TimelinePanel plan={event.plan} onChange={updatePlanPart} eventDate={event.date} />
              </div>
              <div className="space-y-5">
                <VendorPanel plan={event.plan} onChange={updatePlanPart} />
                <LocationSummary event={event} onDiscover={() => setTab("venues")} />
                <IdeasPanel plan={event.plan} />
              </div>
            </div>

            {generating && (
              <p className="flex items-center justify-center gap-2 py-4 text-[12.5px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing your plan…
              </p>
            )}
          </div>
        )}

        {tab === "venues" && (
          <VenuePanel
            event={event}
            onSelectVenue={selectVenue}
            onToggleFavourite={toggleFavourite}
            onSetArea={setAreaFromDevice}
          />
        )}

        {tab === "copilot" && <CopilotPanel event={event} onApply={applyProposal} />}

        {tab === "invitations" && <InvitationsTab event={event} />}
      </div>

      {editing && (
        <EditEventDialog
          open={editing}
          onOpenChange={setEditing}
          event={event}
          onSave={saveDetails}
          saving={saving}
        />
      )}
    </div>
  );
}