import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/server-fns";
import { Image } from "@/components/ui/image";
import { ASSISTANT_ICON_URL } from "@/lib/brandAssets";
import AssistantPanel from "@/components/assistant/AssistantPanel";

export default function AssistantChat() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setError("");
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await ask({ data: { message: question, history } });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setError(err?.message || "The assistant could not answer just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Aurelia"
        className="fixed bottom-[80px] right-4 z-40 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-[0_16px_32px_-18px_hsl(320_27%_24%)] transition-transform hover:-translate-y-0.5 lg:bottom-6 lg:right-6"
      >
        <Image
          src={ASSISTANT_ICON_URL}
          alt="Ask Aurelia"
          className="h-full w-full rounded-full object-cover"
        />
      </button>
    );
  }

  return (
    <AssistantPanel
      messages={messages}
      input={input}
      setInput={setInput}
      send={send}
      loading={loading}
      error={error}
      onClose={() => setOpen(false)}
      onClear={() => {
        setMessages([]);
        setError("");
      }}
    />
  );
}