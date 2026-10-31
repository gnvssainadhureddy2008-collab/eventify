import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { formatINR } from "@/lib/format";
import { VENDOR_STATUSES } from "@/lib/eventTypes";

const statusStyle = {
  "Not Started": "bg-secondary text-muted-foreground",
  Contacted: "bg-[hsl(40_47%_56%/0.18)] text-[hsl(38_45%_32%)]",
  Booked: "bg-[hsl(150_22%_40%/0.14)] text-[hsl(150_30%_28%)]",
  Paid: "bg-[hsl(320_27%_24%/0.1)] text-primary",
};

export default function VendorPanel({ plan, onChange }) {
  const vendors = plan?.vendors || [];
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  function updateVendor(id, patch) {
    onChange({ vendors: vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  }

  function add(e) {
    e.preventDefault();
    if (!type.trim()) return;
    onChange({
      vendors: [
        ...vendors,
        {
          id: `custom-${Date.now()}`,
          type: type.trim(),
          why: "",
          estimated_budget: Number(budget) || 0,
          status: "Not Started",
          notes: "",
          custom: true,
        },
      ],
    });
    setType("");
    setBudget("");
  }

  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[19px] text-primary">Vendor checklist</h3>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Users className="h-3 w-3" /> {vendors.length}
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-muted-foreground">
        Categories to hire — not specific businesses. Track each one as you go.
      </p>

      <ul className="mt-4 space-y-3">
        {vendors.map((v) => (
          <li key={v.id} className="rounded-2xl border border-border/70 bg-background/60 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13.5px] leading-snug text-primary">{v.type}</p>
                {v.estimated_budget > 0 && (
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Estimate {formatINR(v.estimated_budget)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <select
                  value={v.status || "Not Started"}
                  onChange={(e) => updateVendor(v.id, { status: e.target.value })}
                  aria-label={`Status for ${v.type}`}
                  className={`rounded-full border-0 px-2.5 py-1 text-[11px] outline-none ${
                    statusStyle[v.status] || statusStyle["Not Started"]
                  }`}
                >
                  {VENDOR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onChange({ vendors: vendors.filter((x) => x.id !== v.id) })}
                  aria-label={`Remove ${v.type}`}
                  className="text-muted-foreground/50 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {v.why && <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{v.why}</p>}
            <input
              defaultValue={v.notes}
              onBlur={(e) => {
                if (e.target.value !== (v.notes || "")) updateVendor(v.id, { notes: e.target.value });
              }}
              placeholder="Notes — contact, quote, follow-up…"
              aria-label={`Notes for ${v.type}`}
              className="mt-2.5 w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-[12px] outline-none focus:border-accent"
            />
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-4 space-y-2 border-t border-border/60 pt-4">
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Add your own vendor category"
          aria-label="New vendor category"
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Estimate ₹"
            aria-label="Estimated budget"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-[12px] text-primary-foreground"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </form>
    </div>
  );
}