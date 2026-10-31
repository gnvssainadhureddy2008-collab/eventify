import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, FileText, Image as ImageIcon, Save } from "lucide-react";
import InvitationPreview from "@/components/invitations/InvitationPreview";
import { Switch } from "@/components/ui/switch";
import { TEMPLATES, getTemplate, FONT_OPTIONS } from "@/lib/invitationTemplates";
import { exportInvitation } from "@/lib/exportInvitation";

export const Route = createFileRoute("/_authed/invitations/$invitationId")({
  head: () => ({ meta: [{ title: "Invitation editor — Aurelia" }] }),
  component: InvitationEditor,
});

const field =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25";
const label = "text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

function InvitationEditor() {
  const { invitationId } = Route.useParams();
  const [inv, setInv] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [exporting, setExporting] = useState("");
  const [scale, setScale] = useState(1);
  const wrapRef = useRef(null);
  const exportRef = useRef(null);
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Invitation.get(invitationId)
      .then((data) => !cancelled && setInv(data))
      .catch(() => !cancelled && setError("This invitation could not be found."));
    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / 640));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [inv]);

  const save = async (data) => {
    setStatus("saving");
    try {
      await base44.entities.Invitation.update(invitationId, data);
      setStatus("saved");
      dirty.current = false;
    } catch {
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (!inv || !dirty.current) return;
    const timer = setTimeout(() => save(inv), 900);
    return () => clearTimeout(timer);
  }, [inv]);

  const setField = (patch) => {
    dirty.current = true;
    setInv((prev) => ({ ...prev, ...patch }));
  };

  async function download(format) {
    setExporting(format);
    try {
      if (dirty.current) await save(inv);
      await exportInvitation(exportRef.current, {
        format,
        name: inv.design_name || inv.headline || inv.event_name,
      });
      toast.success(`${format === "jpeg" ? "JPEG" : format.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(err?.message || "The download could not be created. Please try again.");
    } finally {
      setExporting("");
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-[26px] text-primary">{error}</h1>
        <Link to="/invitations" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-[13px] text-primary-foreground">
          Back to invitations
        </Link>
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="h-[520px] animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  const template = getTemplate(inv.template);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/invitations" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> All invitations
        </Link>
        <span className="text-[11.5px] text-muted-foreground">
          {status === "saving" ? "Saving…" : status === "saved" ? "All changes saved" : "Changes save automatically"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Invitation editor</p>
          <h1 className="mt-2 text-[26px] leading-tight text-primary sm:text-[34px]">
            {inv.design_name || "Your invitation"}
          </h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => save(inv)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-[12px] text-primary hover:border-accent/60 sm:flex-none sm:py-2"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={() => download("pdf")}
            disabled={!!exporting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 py-2.5 text-[12px] text-primary-foreground disabled:opacity-60 sm:flex-none sm:py-2"
          >
            {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} PDF
          </button>
          <button
            type="button"
            onClick={() => download("png")}
            disabled={!!exporting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-[12px] text-primary disabled:opacity-60 sm:flex-none sm:py-2"
          >
            {exporting === "png" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />} PNG
          </button>
          <button
            type="button"
            onClick={() => download("jpeg")}
            disabled={!!exporting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-[12px] text-primary disabled:opacity-60 sm:flex-none sm:py-2"
          >
            {exporting === "jpeg" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} JPEG
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          <div className="card-soft p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="i-design" className={label}>Design name</label>
                <input id="i-design" value={inv.design_name || ""} onChange={(e) => setField({ design_name: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="i-template" className={label}>Template</label>
                <select
                  id="i-template"
                  value={inv.template}
                  onChange={(e) => setField({ template: e.target.value })}
                  className={field}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="i-font" className={label}>Typography</label>
                <select
                  id="i-font"
                  value={inv.font_style || "display"}
                  onChange={(e) => setField({ font_style: e.target.value })}
                  className={field}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="i-headline" className={label}>Invitation title</label>
                <input id="i-headline" value={inv.headline || ""} onChange={(e) => setField({ headline: e.target.value })} className={field} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="i-host" className={label}>Host names</label>
                <input
                  id="i-host"
                  value={inv.host_names || ""}
                  onChange={(e) => setField({ host_names: e.target.value })}
                  placeholder="Ananya & Rohan, or The Sharma Family"
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="i-wording" className={label}>Invitation wording</label>
                <textarea id="i-wording" rows={3} value={inv.wording || ""} onChange={(e) => setField({ wording: e.target.value })} className={`${field} resize-y`} />
              </div>
              <div>
                <label htmlFor="i-date" className={label}>Date</label>
                <input id="i-date" type="date" value={inv.date || ""} onChange={(e) => setField({ date: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="i-time" className={label}>Time</label>
                <input id="i-time" value={inv.time || ""} onChange={(e) => setField({ time: e.target.value })} placeholder="7:00 PM onwards" className={field} />
              </div>
              <div>
                <label htmlFor="i-venue" className={label}>Venue name</label>
                <input id="i-venue" value={inv.venue_name || ""} onChange={(e) => setField({ venue_name: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="i-addr" className={label}>Venue address</label>
                <input id="i-addr" value={inv.venue_address || ""} onChange={(e) => setField({ venue_address: e.target.value })} className={field} />
              </div>
              <div>
                <label htmlFor="i-rsvp" className={label}>RSVP details</label>
                <input id="i-rsvp" value={inv.rsvp || ""} onChange={(e) => setField({ rsvp: e.target.value })} placeholder="Priya · +91 98xxx xxxxx" className={field} />
              </div>
              <div>
                <label htmlFor="i-dress" className={label}>Dress code (optional)</label>
                <input id="i-dress" value={inv.dress_code || ""} onChange={(e) => setField({ dress_code: e.target.value })} className={field} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="i-note" className={label}>Additional message (optional)</label>
                <textarea id="i-note" rows={2} value={inv.extra_note || ""} onChange={(e) => setField({ extra_note: e.target.value })} className={`${field} resize-y`} />
              </div>
            </div>
          </div>

          <div className="card-soft p-5">
            <p className="text-[13px] text-primary">Colours</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                ["text_color", "Text"],
                ["background_color", "Background"],
                ["accent_color", "Accent"],
              ].map(([key, name]) => (
                <div key={key}>
                  <label htmlFor={`i-${key}`} className={label}>{name}</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      id={`i-${key}`}
                      type="color"
                      value={inv[key] || (key === "text_color" ? template.ink : key === "background_color" ? "#FBF7F0" : template.accent)}
                      onChange={(e) => setField({ [key]: e.target.value })}
                      className="h-9 w-11 cursor-pointer rounded-lg border border-border bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setField({ [key]: "" })}
                      className="text-[11px] text-muted-foreground hover:text-primary"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 px-4 py-3">
              <div>
                <p className="text-[12.5px] text-primary">Optional QR code</p>
                <p className="text-[11px] text-muted-foreground">Links guests to your RSVP page or event details.</p>
              </div>
              <Switch
                checked={!!inv.show_qr}
                onCheckedChange={(v) => setField({ show_qr: v })}
                aria-label="Include QR code"
              />
            </div>
            {inv.show_qr && (
              <div className="mt-3">
                <label htmlFor="i-qr" className={label}>QR destination</label>
                <input
                  id="i-qr"
                  value={inv.qr_data || ""}
                  onChange={(e) => setField({ qr_data: e.target.value })}
                  placeholder="https://… or a short message"
                  className={field}
                />
              </div>
            )}
          </div>
        </div>

        <div className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Live preview</p>
          <div ref={wrapRef} className="overflow-hidden rounded-2xl border border-border/60 bg-secondary/40 p-3">
            <div style={{ width: 640 * scale, height: 900 * scale }}>
              <InvitationPreview invitation={inv} template={template} width={640 * scale} />
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Exports at 1280 × 1800 — sharp enough for print. Your venue details are included automatically when a
            venue is selected for the event.
          </p>
        </div>
      </div>

      <div style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }} aria-hidden="true">
        <InvitationPreview ref={exportRef} invitation={inv} template={template} width={640} />
      </div>
    </div>
  );
}