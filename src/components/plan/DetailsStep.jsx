import { THEMES } from "@/lib/eventTypes";

const field =
  "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelCls = "text-[12px] uppercase tracking-[0.18em] text-muted-foreground";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[11.5px] text-destructive">{children}</p>;
}

export default function DetailsStep({ form, set, errors }) {
  return (
    <div>
      <h2 className="text-[26px] leading-tight text-primary sm:text-[30px]">The details</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        These shape your budget and timeline. You can change any of them later.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="d-name" className={labelCls}>Event name</label>
          <input id="d-name" value={form.name} onChange={(e) => set({ name: e.target.value })} className={field} placeholder="Aurora 2026" />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div>
          <label htmlFor="d-date" className={labelCls}>Event date</label>
          <input id="d-date" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} className={field} />
          <FieldError>{errors.date}</FieldError>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="d-start" className={labelCls}>Start time</label>
            <input id="d-start" type="time" value={form.start_time} onChange={(e) => set({ start_time: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="d-end" className={labelCls}>End time</label>
            <input id="d-end" type="time" value={form.end_time} onChange={(e) => set({ end_time: e.target.value })} className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="d-guests" className={labelCls}>Expected guests</label>
          <input
            id="d-guests"
            type="number"
            min="1"
            value={form.guest_count}
            onChange={(e) => set({ guest_count: e.target.value })}
            className={field}
            placeholder="150"
          />
          <FieldError>{errors.guest_count}</FieldError>
        </div>

        <div>
          <label htmlFor="d-budget" className={labelCls}>Total budget (₹)</label>
          <input
            id="d-budget"
            type="number"
            min="1000"
            step="1000"
            value={form.budget}
            onChange={(e) => set({ budget: e.target.value })}
            className={field}
            placeholder="300000"
          />
          <FieldError>{errors.budget}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="d-theme" className={labelCls}>Preferred style or theme</label>
          <input
            id="d-theme"
            value={form.theme}
            onChange={(e) => set({ theme: e.target.value })}
            className={field}
            placeholder="Warm ivory and gold, garden setting…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ theme: t })}
                className={`rounded-full border px-3 py-1.5 text-[11.5px] transition-colors ${
                  form.theme === t
                    ? "border-accent bg-accent/12 text-primary"
                    : "border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="d-req" className={labelCls}>Additional requirements</label>
          <textarea
            id="d-req"
            value={form.requirements}
            onChange={(e) => set({ requirements: e.target.value })}
            rows={4}
            className={`${field} resize-y`}
            placeholder="Vegetarian food only, outdoor venue, live music and photography, wheelchair accessibility, children's activities, parking for guests…"
          />
          <p className="mt-2 text-[12px] text-muted-foreground">
            Type anything that matters — the plan is built around these words.
          </p>
        </div>
      </div>
    </div>
  );
}