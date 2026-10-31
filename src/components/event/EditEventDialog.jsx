import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const field =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25";
const label = "text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

export default function EditEventDialog({ open, onOpenChange, event, onSave, saving }) {
  const [form, setForm] = useState(null);

  const values = form ?? {
    name: event.name || "",
    date: event.date || "",
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    guest_count: event.guest_count ?? "",
    budget: event.budget ?? "",
    theme: event.theme || "",
    requirements: event.requirements || "",
    location_label: event.location_label || "",
    location_address: event.location_address || "",
    reminder_enabled: !!event.reminder_enabled,
    reminder_days: event.reminder_days ?? 3,
  };

  const set = (patch) => setForm({ ...values, ...patch });

  return (
    <Dialog open={open} onOpenChange={(v) => { setForm(null); onOpenChange(v); }}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="serif-display text-[24px] font-normal text-primary">Event details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="e-name" className={label}>Event name</label>
            <input id="e-name" value={values.name} onChange={(e) => set({ name: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="e-date" className={label}>Date</label>
            <input id="e-date" type="date" value={values.date} onChange={(e) => set({ date: e.target.value })} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="e-start" className={label}>Start</label>
              <input id="e-start" type="time" value={values.start_time} onChange={(e) => set({ start_time: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="e-end" className={label}>End</label>
              <input id="e-end" type="time" value={values.end_time} onChange={(e) => set({ end_time: e.target.value })} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="e-guests" className={label}>Guests</label>
            <input id="e-guests" type="number" min="1" value={values.guest_count} onChange={(e) => set({ guest_count: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="e-budget" className={label}>Budget (₹)</label>
            <input id="e-budget" type="number" min="0" step="1000" value={values.budget} onChange={(e) => set({ budget: e.target.value })} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="e-theme" className={label}>Style or theme</label>
            <input id="e-theme" value={values.theme} onChange={(e) => set({ theme: e.target.value })} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="e-req" className={label}>Additional requirements</label>
            <textarea id="e-req" rows={3} value={values.requirements} onChange={(e) => set({ requirements: e.target.value })} className={`${field} resize-y`} />
          </div>
          <div>
            <label htmlFor="e-area" className={label}>Area or locality</label>
            <input id="e-area" value={values.location_label} onChange={(e) => set({ location_label: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="e-addr" className={label}>Address</label>
            <input id="e-addr" value={values.location_address} onChange={(e) => set({ location_address: e.target.value })} className={field} />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3">
            <div>
              <p className="text-[13px] text-primary">Remind me before this event</p>
              <p className="text-[11.5px] text-muted-foreground">Shown on your calendar and events list.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={values.reminder_days}
                onChange={(e) => set({ reminder_days: Number(e.target.value) })}
                disabled={!values.reminder_enabled}
                aria-label="Days before the event"
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] disabled:opacity-50"
              >
                {[1, 2, 3, 7, 14].map((d) => (
                  <option key={d} value={d}>{d} day{d > 1 ? "s" : ""} before</option>
                ))}
              </select>
              <Switch
                checked={values.reminder_enabled}
                onCheckedChange={(v) => set({ reminder_enabled: v })}
                aria-label="Enable reminder"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => {
              onSave({
                ...values,
                guest_count: Number(values.guest_count) || 0,
                budget: Number(values.budget) || 0,
                reminder_days: Number(values.reminder_days) || 3,
              });
              setForm(null);
            }}
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}