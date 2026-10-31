import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { Mail, Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { asItems, formatShortDate } from "@/lib/format";

export default function InvitationsTab({ event }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Invitation.filter({ event_id: event.id }, { sort: "-created_date", limit: 50 })
      .then((page) => {
        if (!cancelled) setItems(asItems(page));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  async function remove(id) {
    await base44.entities.Invitation.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Invitation deleted");
  }

  return (
    <div className="card-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[19px] text-primary">Invitations</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Design as many as you like — each one saves separately.
          </p>
        </div>
        <Link
          to="/invitations/new"
          search={{ event: event.id }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> New invitation
        </Link>
      </div>

      {loading && <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p>}

      {!loading && items.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-border px-5 py-10 text-center">
          <Mail className="mx-auto h-5 w-5 text-accent" />
          <p className="mt-3 text-[13.5px] text-primary">No invitation yet</p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
            Pick a template, personalise the wording, and download it as PDF, PNG or JPEG.
          </p>
        </div>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] text-primary">{inv.design_name || inv.headline || "Invitation"}</p>
              <p className="text-[11.5px] text-muted-foreground">
                {inv.template} · {formatShortDate(inv.date)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                to="/invitations/$invitationId"
                params={{ invitationId: inv.id }}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-primary hover:border-accent/60"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={() => remove(inv.id)}
                aria-label="Delete invitation"
                className="text-muted-foreground/50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}