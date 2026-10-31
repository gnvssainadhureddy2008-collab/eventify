import CategoryImage from "@/components/event/CategoryImage";
import { Check } from "lucide-react";
import { EVENT_TYPES } from "@/lib/eventTypes";

export default function EventTypeStep({ eventType, customType, name, onChange }) {
  return (
    <div>
      <h2 className="text-[26px] leading-tight text-primary sm:text-[30px]">What are we celebrating?</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        Choose the closest type. You can describe it freely if it is not listed.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {EVENT_TYPES.map((type) => {
          const active = eventType === type.label;
          return (
            <button
              key={type.label}
              type="button"
              onClick={() => onChange({ event_type: type.label })}
              aria-pressed={active}
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                active
                  ? "border-accent ring-1 ring-accent/50"
                  : "border-border/70 hover:-translate-y-0.5 hover:border-accent/50"
              }`}
            >
              <div className="relative h-[86px] overflow-hidden sm:h-[104px]">
                <CategoryImage
                  src={type.image}
                  eventType={type.label}
                  alt={`${type.label} celebration`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(320_25%_16%/0.55)] via-transparent to-transparent" />
                {active && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <span className="block bg-card px-3 py-2.5 text-[12.5px] leading-tight text-primary">
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      {eventType === "Other / Custom Event" && (
        <div className="mt-6 animate-rise">
          <label htmlFor="custom-type" className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Your event type
          </label>
          <input
            id="custom-type"
            value={customType}
            onChange={(e) => onChange({ custom_type: e.target.value })}
            placeholder="For example: Sangeet night, book launch, alumni gala"
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
      )}

      <div className="mt-7">
        <label htmlFor="event-name" className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Event name
        </label>
        <input
          id="event-name"
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="For example: Aurora 2026"
          className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <p className="mt-2 text-[12px] text-muted-foreground">
          The name is yours to choose — it is separate from the event type.
        </p>
      </div>
    </div>
  );
}