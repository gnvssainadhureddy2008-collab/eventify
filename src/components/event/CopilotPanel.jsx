import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, Loader2, Check, X } from "lucide-react";
import { askCopilot } from "@/lib/server-fns";

const SUGGESTIONS = [
  "Reduce my budget by ₹10,000",
  "Suggest a cheaper venue",
  "Make this event more elegant",
  "Add more activities for children",
  "Give me a vegetarian menu",
  "What tasks are still pending?",
];

export default function CopilotPanel({ event, onApply }) {
  const ask = useServerFn(askCopilot);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState("");

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setError("");
    setProposal(null);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await ask({ data: { eventId: event.id, message: question, history } });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.changes?.length) setProposal(res);
    } catch (err) {
      setError(err?.message || "The copilot could not answer just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (!proposal) return;
    await onApply(proposal.proposal);
    setMessages((prev) => [...prev, { role: "assistant", content: "Applied to your plan." }]);
    setProposal(null);
  }

  return (
    <div className="card-soft flex h-[560px] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
          <Sparkles className="h-4 w-4 text-[hsl(40_40%_40%)]" />
        </span>
        <div>
          <h3 className="text-[16px] text-primary">Event copilot</h3>
          <p className="text-[11px] text-muted-foreground">Knows this event and its saved plan</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Ask for a change and you will see the proposed plan before anything is saved.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-2.5 py-1.5 text-[11px] text-primary transition-colors hover:border-accent/60 hover:bg-secondary/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-secondary/70 text-primary"
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking through your plan…
          </div>
        )}

        {proposal && (
          <div className="animate-rise rounded-2xl border border-accent/50 bg-accent/8 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(40_40%_38%)]">Proposed changes</p>
            <ul className="mt-2 space-y-1.5">
              {proposal.changes.map((c, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-primary">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={apply}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11.5px] text-primary-foreground"
              >
                <Check className="h-3 w-3" /> Apply changes
              </button>
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[11.5px] text-muted-foreground"
              >
                <X className="h-3 w-3" /> Dismiss
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-[12px] text-destructive">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border/60 px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your copilot…"
          aria-label="Ask the event copilot"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}