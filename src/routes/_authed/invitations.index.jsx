import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, Mail, Trash2, ArrowRight } from "lucide-react";
import InvitationPreview from "@/components/invitations/InvitationPreview";
import { getTemplate } from "@/lib/invitationTemplates";
import { asItems, formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/invitations/")({
  head: () => ({ meta: [{ title: "My Invitations — Aurelia" }] }),
  component: InvitationsPage,
});

function InvitationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Invitation.list("-created_date", 100)
      .then((page) => !cancelled && setItems(asItems(page)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id) {
    await base44.entities.Invitation.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Invitation deleted");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Invitation studio</p>
          <h1 className="mt-2 text-[30px] leading-tight text-primary sm:text-[40px]">Your invitations</h1>
        </div>
        <Link
          to="/invitations/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[13px] text-primary-foreground transition-all hover:shadow-[0_18px_36px_-20px_hsl(320_27%_20%)]"
        >
          <Plus className="h-4 w-4" /> New invitation
        </Link>
      </div>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mt-10 rounded-[2rem] border border-dashed border-border px-6 py-16 text-center">
          <Mail className="mx-auto h-6 w-6 text-accent" />
          <h2 className="mt-4 text-[22px] text-primary">No invitations yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Choose a template, personalise the wording, then download it as a PDF, PNG or JPEG.
          </p>
          <Link
            to="/invitations/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground"
          >
            Design an invitation <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((inv) => {
          const template = getTemplate(inv.template);
          return (
            <article
              key={inv.id}
              className="group overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_50px_-38px_hsl(320_25%_20%)]"
            >
              <Link to="/invitations/$invitationId" params={{ invitationId: inv.id }} className="block">
                <div className="relative h-[260px] overflow-hidden bg-secondary/40">
                  <div className="absolute left-1/2 top-3 -translate-x-1/2">
                    <div style={{ width: 640 * 0.28, height: 900 * 0.28, overflow: "hidden" }}>
                      <InvitationPreview invitation={inv} template={template} width={640 * 0.28} />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                </div>
              </Link>
              <div className="p-4">
                <p className="truncate text-[15px] text-primary">{inv.design_name || inv.headline || "Invitation"}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {template.label} · {inv.event_name || "Event"} · {formatShortDate(inv.date)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <Link
                    to="/invitations/$invitationId"
                    params={{ invitationId: inv.id }}
                    className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-[hsl(40_40%_42%)]"
                  >
                    Open editor <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(inv.id)}
                    aria-label="Delete invitation"
                    className="text-muted-foreground/50 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}