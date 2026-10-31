import { useEffect, useRef } from "react";
import { Send, Loader2, X, RotateCcw } from "lucide-react";
import { Image } from "@/components/ui/image";
import { ASSISTANT_ICON_URL } from "@/lib/brandAssets";

const SUGGESTIONS = [
  "Plan a birthday for 40 guests on ₹80,000",
  "What should I book first for a wedding?",
  "Give me a checklist for 3 months out",
  "How much should I spend on catering?",
];

export default function AssistantPanel({ messages, input, setInput, send, loading, error, onClose, onClear }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error]);

  return (
    <div className="fixed inset-x-3 top-[92px] bottom-[76px] z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-40px_hsl(320_27%_20%)] lg:inset-auto lg:bottom-24 lg:right-6 lg:top-auto lg:h-[560px] lg:w-[380px]">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Image src={ASSISTANT_ICON_URL} alt="" className="h-6 w-6 rounded-md object-cover" />
          <div>
            <p className="serif-display text-[16px] leading-tight">Aurelia Assistant</p>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-primary-foreground/60">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Start a new conversation"
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Ask me anything about your celebration — budgets, timelines, etiquette or ideas. I can see your saved
              events for context.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:border-accent/60 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-foreground"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            Thinking
          </div>
        )}
        {error && <p className="text-[12px] text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-border/70 bg-background/60 px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your event"
            aria-label="Message the assistant"
            className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/70"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}