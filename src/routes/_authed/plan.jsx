import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EventTypeStep from "@/components/plan/EventTypeStep";
import DetailsStep from "@/components/plan/DetailsStep";
import LocationStep from "@/components/plan/LocationStep";
import { displayType, typeMeta } from "@/lib/eventTypes";

export const Route = createFileRoute("/_authed/plan")({
  validateSearch: (search) => ({
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  head: () => ({ meta: [{ title: "Plan an Event — Aurelia" }] }),
  component: PlanPage,
});

const STEPS = ["Event type", "Details", "Location"];

function PlanPage() {
  const navigate = useNavigate();
  const { date } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    event_type: "",
    custom_type: "",
    name: "",
    date: date || "",
    start_time: "",
    end_time: "",
    guest_count: "",
    budget: "",
    theme: "",
    requirements: "",
    location_label: "",
    location_address: "",
    location_lat: null,
    location_lng: null,
  });

  const set = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      delete next.location;
      return next;
    });
  };

  function validate(current) {
    const e = {};
    if (current === 0) {
      if (!form.event_type) e.event_type = "Choose an event type to continue.";
      if (form.event_type === "Other / Custom Event" && !form.custom_type.trim())
        e.custom_type = "Describe your event type.";
      if (!form.name.trim()) e.name = "Give your event a name.";
    }
    if (current === 1) {
      if (!form.name.trim()) e.name = "Give your event a name.";
      if (!form.date) e.date = "Pick the event date.";
      else if (new Date(`${form.date}T23:59:59`) < new Date()) e.date = "The date is in the past.";
      if (!form.guest_count || Number(form.guest_count) < 1) e.guest_count = "How many guests?";
      if (!form.budget || Number(form.budget) < 1000) e.budget = "Enter a budget of at least ₹1,000.";
    }
    if (current === 2) {
      const hasArea = form.location_label.trim().length > 1 || form.location_address.trim().length > 3;
      if (!hasArea && typeof form.location_lat !== "number")
        e.location = "Select a location on the map or type the area before confirming.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confirm() {
    if (!validate(2)) return;
    setSaving(true);
    try {
      const created = await base44.entities.Event.create({
        name: form.name.trim(),
        event_type: form.event_type,
        custom_type: form.event_type === "Other / Custom Event" ? form.custom_type.trim() : "",
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        guest_count: Number(form.guest_count) || 0,
        budget: Number(form.budget) || 0,
        theme: form.theme.trim(),
        requirements: form.requirements.trim(),
        location_label: form.location_label.trim(),
        location_address: form.location_address.trim(),
        location_lat: typeof form.location_lat === "number" ? form.location_lat : undefined,
        location_lng: typeof form.location_lng === "number" ? form.location_lng : undefined,
        cover_image: typeMeta(form.event_type).image,
        reminder_enabled: false,
        reminder_days: 3,
      });
      navigate({
        to: "/events/$eventId",
        params: { eventId: created.id },
      });
    } catch (err) {
      setErrors({ location: err?.message || "The event could not be saved. Please try again." });
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Create an event</p>
          <h1 className="mt-2 text-[30px] leading-tight text-primary sm:text-[38px]">
            {step === 0 ? "Let's begin" : step === 1 ? "A little detail" : "The where"}
          </h1>
        </div>
        <span className="text-[12px] text-muted-foreground">
          Step {step + 1} of 3 · {displayType(form) || STEPS[step]}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <div className="h-[3px] overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700"
                  style={{ width: i < step ? "100%" : i === step ? "55%" : "0%" }}
                />
              </div>
              <span
                className={`mt-2 hidden text-[11px] uppercase tracking-[0.16em] sm:block ${
                  i <= step ? "text-primary" : "text-muted-foreground/70"
                }`}
              >
                {i < step ? <Check className="mr-1 inline h-3 w-3" /> : null}
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(errors.event_type || errors.custom_type) && (
        <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[12.5px] text-destructive">
          {errors.event_type || errors.custom_type}
        </p>
      )}

      <div className="mt-8 animate-rise" key={step}>
        {step === 0 && (
          <EventTypeStep
            eventType={form.event_type}
            customType={form.custom_type}
            name={form.name}
            onChange={set}
          />
        )}
        {step === 1 && <DetailsStep form={form} set={set} errors={errors} />}
        {step === 2 && (
          <LocationStep form={form} set={set} errors={errors} onConfirm={confirm} saving={saving} />
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border/60 pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[13px] text-primary transition-colors hover:border-accent/60 disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        {step < 2 && (
          <button
            type="button"
            onClick={next}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </div>
  );
}