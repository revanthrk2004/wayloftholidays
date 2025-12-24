"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/components/ui/cn";

type ChatMsg = { role: "user" | "assistant"; text: string };

type Captured = {
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  fromCity: string | null;
  destination: string | null;
  dates: string | null;
  nights: string | null;
  budget: string | null;
  travellers: string | null;
  style: string | null;
  priorities: string | null;
  notes: string | null;
};

type Meta = {
  stage?: "intake" | "refine" | "confirm_done" | "completed";
  captured?: Partial<Captured>;
  lastEmailHash?: string | null;
  didEmail?: boolean;
};

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function lastAssistantText(messages: ChatMsg[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") return messages[i].text || "";
  }
  return "";
}

function assistantIsAskingAnythingElse(messages: ChatMsg[]) {
  const t = lastAssistantText(messages);
  return /anything else you want to add\?/i.test(t);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState<Meta>({
    stage: "intake",
    captured: {},
    lastEmailHash: null,
  });

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hi, I’m Wayloft Ai. Tell me what kind of trip you want and where you’re thinking. I’ll guide you from there.",
    },
  ]);

  const sessionIdRef = useRef<string>(makeSessionId());
  const listRef = useRef<HTMLDivElement | null>(null);

  const hint = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 0 && h < 6) return "Late night planning hits different.";
    if (h < 12) return "Morning trip planning energy.";
    if (h < 18) return "Let’s build your perfect itinerary.";
    return "Evening travel vibes. Where to next?";
  }, []);

  useEffect(() => {
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
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, loading, meta.stage]);

  async function send(customText?: string) {
    const msg = (customText ?? text).trim();
    if (!msg || loading) return;

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setText("");
    setLoading(true);

    const history: ChatMsg[] = [...messages, { role: "user", text: msg }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          messages: history,
          meta,
        }),
      });

      const data = (await res.json()) as { reply?: string; meta?: Meta };

      const reply =
        (data.reply || "").trim() || "Got it. What dates are you travelling and what’s your total budget for the trip?";

      setMessages((m) => [...m, { role: "assistant", text: reply }]);

      if (data.meta) setMeta((prev) => ({ ...prev, ...data.meta }));
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Network issue. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showAnythingElseButtons =
    meta.stage === "confirm_done" && assistantIsAskingAnythingElse(messages) && !loading;

  const showOptionalAddMore = meta.stage === "completed";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-9999 grid h-12 w-12 place-items-center rounded-2xl bg-(--primary) text-white shadow-[0_18px_60px_rgba(11,60,111,0.28)] hover:opacity-95 active:opacity-90"
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
            transition={{ duration: 0.22 }}
            className="fixed bottom-5 right-5 z-9999 w-[92vw] max-w-sm overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_30px_90px_rgba(11,60,111,0.22)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-black/10 bg-white">
                  <Image src="/wayloft-logo.png" alt="Wayloft" fill className="object-cover" priority />
                </div>

                <div className="leading-tight">
                  <div className="text-sm font-semibold text-(--primary)">Wayloft Ai</div>
                  <div className="text-xs text-(--muted)">{hint}</div>
                </div>
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
                className="h-80 space-y-3 overflow-y-auto rounded-2xl bg-(--light) p-3 ring-1 ring-black/5"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "w-fit max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-(--primary) text-white"
                          : "bg-white text-(--text) ring-1 ring-black/10"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex w-full justify-start">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-(--muted) ring-1 ring-black/10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}

                {showAnythingElseButtons && (
                  <div className="flex w-full justify-end gap-2 pt-1">
                    <button
                      onClick={() => send("Yes")}
                      className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-black/10 hover:bg-black/5"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => send("No")}
                      className="rounded-full bg-(--primary) px-4 py-2 text-sm text-white hover:opacity-95"
                    >
                      No
                    </button>
                  </div>
                )}

                {showOptionalAddMore && !loading && (
                  <div className="pt-2 text-xs text-(--muted)">
                    We’ve saved your details. If you want to add anything, just message here.
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
                  placeholder={
                    showOptionalAddMore
                      ? "Add more details (optional)"
                      : "Eg: Morocco, Jan 14–20, £2000 total, 2 people"
                  }
                  className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none ring-1 ring-black/10 placeholder:text-(--muted) focus:ring-black/20"
                />
                <button
                  onClick={() => send()}
                  className={cn(
                    "grid h-11 w-12 place-items-center rounded-2xl bg-(--primary) text-white hover:opacity-95 active:opacity-90",
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
