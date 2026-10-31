import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import InvitationPreview from "@/components/invitations/InvitationPreview";
import { TEMPLATES, templatesForType } from "@/lib/invitationTemplates";
import { displayType } from "@/lib/eventTypes";
import { asItems, formatTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/invitations/new")({
  validateSearch: (search) => ({
    event: typeof search.event === "string" ? search.event : undefined,
  }),
  head: () => ({ meta: [{ title: "New invitation — Aurelia" }] }),
  component: NewInvitationPage,
});

function NewInvitationPage() {
  const { event: eventParam } = Route.useSearch();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(eventParam || "");
  const [templateId, setTemplateId] = useState("elegant-minimal");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    base44.entities.Event.list("-created_date", 100).then((page) => {
      const items = asItems(page);
      setEvents(items);
      if (!eventParam && items.length) setEventId((prev) => prev || items[0].id);
    });
  }, [eventParam]);

  const event = events.find((e) => e.id === eventId) || null;

  const recommended = useMemo(() => {
    const list = event ? templatesForType(event.event_type) : [];
    if (!list.length) return TEMPLATES;
    const rest = TEMPLATES.filter((t) => !list.some((l) => l.id === t.id));
    return [...list, ...rest];
  }, [event]);

  useEffect(() => {
    if (event && templatesForType(event.event_type).length) {
      setTemplateId((prev) =>
        TEMPLATES.some((t) => t.id === prev) && templatesForType(event.event_type).some((t) => t.id === prev)
          ? prev
          : templatesForType(event.event_type)[0].id,
      );
    }
  }, [event?.id]);

  const sample = event
    ? {
        event_name: event.name,
        headline: event.name,
        host_names: "",
        wording: "Together with family and friends, we invite you to share in our celebration.",
        date: event.date,
        time: [formatTime(event.start_time), formatTime(event.end_time)].filter(Boolean).join(" – "),
        venue_name: event.venue_name || event.location_label || "",
        venue_address: event.venue_address || event.location_address || "",
      }
    : { headline: "Your Celebration", date: "", wording: "" };

  async function create() {
    if (!event) {
      toast.error("Choose the event this invitation is for.");
      return;
    }
    setCreating(true);
    try {
      const created = await base44.entities.Invitation.create({
        event_id: event.id,
        event_name: event.name,
        design_name: `${event.name} — ${TEMPLATES.find((t) => t.id === templateId)?.label || "Invitation"}`,
        template: templateId,
        headline: event.name,
        host_names: "",
        wording: "Together with family and friends, we invite you to share in our celebration.",
        date: event.date || "",
        time: [formatTime(event.start_time), formatTime(event.end_time)].filter(Boolean).join(" – "),
        venue_name: event.venue_name || event.location_label || "",
        venue_address: event.venue_address || event.location_address || "",
        rsvp: "",
        dress_code: "",
        extra_note: "",
        font_style: "display",
        text_color: "",
        background_color: "",
        accent_color: "",
        show_qr: false,
        qr_data: "",
      });
      navigate({ to: "/invitations/$invitationId", params: { invitationId: created.id } });
    } catch (err) {
      toast.error(err?.message || "The invitation could not be saved.");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <button
        type="button"
        onClick={() => navigate({ to: "/invitations" })}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All invitations
      </button>

      <div className="mt-4">
        <p className="eyebrow">New invitation</p>
        <h1 className="mt-2 text-[30px] leading-tight text-primary sm:text-[40px]">Choose a template</h1>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="inv-event" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            For which event?
          </label>
          <select
            id="inv-event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-1.5 block min-w-[240px] rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] outline-none focus:border-accent"
          >
            <option value="">Select an event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {displayType(e)}
              </option>
            ))}
          </select>
        </div>
        {events.length === 0 && (
          <p className="text-[12.5px] text-muted-foreground">
            You need an event first — create one and come back.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recommended.map((t) => {
          const active = templateId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id)}
              className={`group relative overflow-hidden rounded-3xl border text-left transition-all duration-300 ${
                active ? "border-accent ring-1 ring-accent/40" : "border-border/70 hover:-translate-y-0.5 hover:border-accent/40"
              }`}
            >
              <div className="relative h-[250px] overflow-hidden bg-secondary/40">
                <div className="absolute left-1/2 top-2.5 -translate-x-1/2">
                  <div style={{ width: 640 * 0.27, height: 900 * 0.27, overflow: "hidden" }}>
                    <InvitationPreview invitation={sample} template={t} width={640 * 0.27} />
                  </div>
                </div>
                {active && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="bg-card px-4 py-3">
                <p className="text-[14px] text-primary">{t.label}</p>
                <p className="text-[11.5px] text-muted-foreground">{t.blurb}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={create}
          disabled={!event || creating}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[13px] text-primary-foreground disabled:opacity-50"
        >
          {creating && <Loader2 className="h-4 w-4 animate-spin" />}
          {creating ? "Creating…" : "Create invitation"}
        </button>
        <span className="text-[11.5px] text-muted-foreground">
          You can change the template and wording at any time.
        </span>
      </div>
    </div>
  );
}