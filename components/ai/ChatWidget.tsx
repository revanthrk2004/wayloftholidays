"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/components/ui/cn";

type ChatMsg = { role: "user" | "assistant"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Tell me your destination, dates, budget, and travellers. I’ll shape a premium plan around you.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const hint = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 0 && h < 6) return "Late night planning hits different.";
    if (h < 12) return "Morning trip planning energy.";
    if (h < 18) return "Let’s build your perfect itinerary.";
    return "Evening travel vibes. Tell me your dream trip.";
  }, []);

  useEffect(() => {
    // allow Plan page to open chat + prefill message
    function onOpen(e: Event) {
      const ce = e as CustomEvent<{ prefill?: string }>;
      const prefill = ce?.detail?.prefill?.trim();
      setOpen(true);
      if (prefill) setText(prefill);
    }

    window.addEventListener("wayloft:chat_open", onOpen as EventListener);
    return () => window.removeEventListener("wayloft:chat_open", onOpen as EventListener);
  }, []);

  useEffect(() => {
    // auto scroll
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, loading]);

  async function send() {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = (await res.json()) as { reply?: string };
      const reply = (data.reply || "").trim() || "Tell me your destination, dates, and budget and I’ll plan it.";

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Network issue. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-2xl bg-(--primary) text-white shadow-[0_18px_60px_rgba(11,60,111,0.28)] hover:opacity-95 active:opacity-90"
        aria-label="Open chat"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_30px_90px_rgba(11,60,111,0.22)]"
          >
            <div className="flex items-center justify-between border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur-xl">
              <div className="leading-tight">
                <div className="text-sm font-semibold text-(--primary)">Wayloft Concierge</div>
                <div className="text-xs text-(--muted)">{hint}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-black/5"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-(--muted)" />
              </button>
            </div>

            <div className="p-4">
              <div
                ref={listRef}
                className="h-300px space-y-3 overflow-auto rounded-2xl bg-(--light) p-3 ring-1 ring-black/5"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "ml-auto bg-(--primary) text-white"
                        : "mr-auto bg-white text-(--text) ring-1 ring-black/10"
                    )}
                  >
                    {m.text}
                  </div>
                ))}

                {loading && (
                  <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-(--muted) ring-1 ring-black/10">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                  }}
                  placeholder="Eg: Maldives in Feb, 7 nights, £2k"
                  className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none ring-1 ring-black/10 placeholder:text-(--muted) focus:ring-black/20"
                />
                <button
                  onClick={send}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-2xl bg-(--primary) text-white hover:opacity-95 active:opacity-90",
                    (text.trim().length === 0 || loading) && "opacity-60 pointer-events-none"
                  )}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-(--muted)">
                By sending, you agree we can contact you about your trip.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
