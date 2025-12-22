"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { Sparkles } from "lucide-react";

export default function TripPlannerBar() {
  const [text, setText] = useState("");

  function send() {
    const msg =
      text.trim().length > 0
        ? `Hi Wayloft, please plan this trip: ${text.trim()}`
        : "Hi Wayloft, I want help planning a trip. Destination, dates, and budget:";
    window.dispatchEvent(new CustomEvent("wayloft:chat_open", { detail: { prefill: msg } }));
  }

  return (
    <div className="border-t border-black/5 bg-white">
      <Container className="py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-(--primary)">
            <Sparkles className="h-4 w-4 text-(--secondary)" />
            Quick plan
          </div>

          <div className="flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="h-12 w-full bg-transparent px-4 text-sm outline-none placeholder:text-(--muted)"
              placeholder="Eg: Dubai in March, 5 nights, £1.5k pp, luxury + shopping"
            />
            <button
              onClick={send}
              className="h-12 px-5 bg-(--primary) text-white text-sm font-semibold hover:opacity-95"
            >
              Send
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
