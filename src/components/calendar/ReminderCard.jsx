import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, Mail, Send } from "lucide-react";
import { getDeadlineDigest, sendDeadlineDigest } from "@/lib/server-fns";

export default function ReminderCard() {
  const loadDigest = useServerFn(getDeadlineDigest);
  const sendDigest = useServerFn(sendDeadlineDigest);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadDigest()
      .then((result) => !cancelled && setDigest(result))
      .catch(() => !cancelled && setError("Could not load your upcoming deadlines."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [loadDigest]);

  async function handleSend() {
    setSending(true);
    setNotice("");
    setError("");
    try {
      const result = await sendDigest();
      if (result.sent) {
        setNotice(`Reminder sent to ${result.recipient}.`);
        setDigest(result);
      } else {
        setNotice("Nothing is due in the next 7 days, so no email was sent.");
      }
    } catch (e) {
      setError(e?.message || "The email could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const count = digest?.total || 0;

  return (
    <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-border/60 bg-card px-5 py-6 sm:px-8 sm:py-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-xl">
          <p className="eyebrow">Reminders</p>
          <h2 className="mt-2 font-heading text-[22px] leading-snug text-primary sm:text-[26px]">
            Deadline reminders in your inbox
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Pending timeline tasks due in the next 7 days, including anything overdue, are emailed to you
            each morning from your Gmail account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || loading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[12.5px] text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {sending ? "Sending" : "Send digest now"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking your timeline…
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {count === 0
                ? "No deadlines in the next 7 days"
                : `${count} task${count === 1 ? "" : "s"} due soon`}
              {digest?.overdue ? ` · ${digest.overdue} overdue` : ""}
            </span>
            {digest?.recipient && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-accent" /> {digest.recipient}
              </span>
            )}
          </>
        )}
      </div>

      {notice && <p className="mt-3 text-[12px] text-primary">{notice}</p>}
      {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
    </div>
  );
}