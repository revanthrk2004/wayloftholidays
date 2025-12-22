"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/components/ui/cn";

declare global {
  interface WindowEventMap {
    "wayloft:chat_open": CustomEvent<{ prefill?: string }>;
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const hint = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 0 && h < 6) return "Late night planning hits different.";
    if (h < 12) return "Morning trip planning energy.";
    if (h < 18) return "Let’s build your perfect itinerary.";
    return "Evening travel vibes. Tell me your dream trip.";
  }, []);

  useEffect(() => {
    const onOpen = (e: WindowEventMap["wayloft:chat_open"]) => {
      setOpen(true);
      const prefill = e.detail?.prefill?.trim();
      if (prefill) setText(prefill);
    };
    window.addEventListener("wayloft:chat_open", onOpen as EventListener);
    return () => window.removeEventListener("wayloft:chat_open", onOpen as EventListener);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-60 grid h-12 w-12 place-items-center rounded-2xl bg-(--primary) text-white shadow-[0_18px_60px_rgba(11,60,111,0.28)] hover:opacity-95 active:opacity-90"
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
            className="fixed bottom-5 right-5 z-70 w-[92vw] max-w-sm overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_30px_90px_rgba(11,60,111,0.22)]"
          >
            <div className="flex items-center justify-between border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur-xl">
              <div className="leading-tight">
                <div className="text-sm font-semibold text-(--primary)">Wayloft Concierge</div>
                <div className="text-xs text-(--muted)">{hint}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-black/3"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-(--muted)" />
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-2xl bg-(--light) p-3 text-sm text-(--primary) ring-1 ring-black/5">
                I’m currently offline, but drop your destination + dates + budget and I’ll get back to you.
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Eg: Maldives in Feb, 7 nights, £2k"
                  className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none ring-1 ring-black/10 placeholder:text-(--muted) focus:ring-black/20"
                />
                <button
                  onClick={() => setText("")}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-2xl bg-(--primary) text-white hover:opacity-95 active:opacity-90",
                    text.trim().length === 0 && "pointer-events-none opacity-60"
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
