"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { cn } from "@/components/ui/cn";

type PlanForm = {
  name: string;
  email: string;
  whatsapp: string;
  destination: string;
  fromCity: string;
  dates: string;
  duration: string;
  budget: string;
  travelers: string;
  style: string[];
  priorities: string[];
  notes: string;
};

const STYLE_OPTIONS = [
  "Luxury",
  "Romantic",
  "Adventure",
  "Relaxation",
  "Foodie",
  "City vibes",
  "Nature",
  "Shopping",
  "Family",
] as const;

const PRIORITY_OPTIONS = [
  "5-star stays",
  "Best views",
  "Local experiences",
  "Hidden gems",
  "Fast itinerary",
  "Slow itinerary",
  "Instagram spots",
  "Safety & comfort",
] as const;

const cardIn = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
  },
};

function buildSummary(form: PlanForm) {
  const style = form.style.length ? form.style.join(", ") : "Any";
  const pri = form.priorities.length ? form.priorities.join(", ") : "Any";

  return `Plan request for Wayloft Holidays:
Name: ${form.name || "-"}
Email: ${form.email || "-"}
WhatsApp: ${form.whatsapp || "-"}
From: ${form.fromCity || "-"}
Destination: ${form.destination || "-"}
Dates: ${form.dates || "-"}
Duration: ${form.duration || "-"}
Budget: ${form.budget || "-"}
Travellers: ${form.travelers || "-"}
Style: ${style}
Priorities: ${pri}
Notes: ${form.notes || "-"}

#travelwithWayloft`;
}

export default function PlanClient() {
  const [form, setForm] = useState<PlanForm>({
    name: "",
    email: "",
    whatsapp: "",
    destination: "",
    fromCity: "London",
    dates: "",
    duration: "",
    budget: "",
    travelers: "2",
    style: ["Luxury", "Romantic"],
    priorities: ["5-star stays", "Best views"],
    notes: "",
  });

  const [sending, setSending] = useState(false);
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const summary = useMemo(() => buildSummary(form), [form]);

  function toggle(list: string[], value: string) {
    if (list.includes(value)) return list.filter((x) => x !== value);
    return [...list, value];
  }

  function update<K extends keyof PlanForm>(key: K, val: PlanForm[K]) {
    setForm((p) => ({ ...p, [key]: val }));
    if (state !== "idle") setState("idle");
    if (errorMsg) setErrorMsg("");
  }

  async function sendRequest() {
    if (sending) return;

    // lightweight “required” checks (only the essentials)
    if (!form.name.trim() || !form.email.trim() || !form.destination.trim()) {
      setState("error");
      setErrorMsg("Please fill at least: Name, Email, Destination.");
      return;
    }

    setSending(true);
    setState("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          summary, // server can use this directly too
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || (data as any).ok === false) {
        const msg =
          (data as any)?.error ||
          "Email failed. Check your Resend domain/from address settings.";
        throw new Error(msg);
      }

      setState("sent");
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="relative overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-520px w-520px -translate-x-1/2 rounded-full bg-(--light) blur-3xl" />
        <div className="absolute -bottom-72 right--140px h-560px w-560px rounded-full bg-(--light) blur-3xl" />
        <div className="absolute inset-0 opacity-[0.55] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-size-[18px_18px]" />
      </div>

      <Container className="relative py-10 md:py-14">
        <motion.div initial="hidden" animate="show" variants={cardIn} className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-(--primary) ring-1 ring-black/10">
                <Sparkles className="h-4 w-4" />
                <span>Wayloft Trip Request</span>
                <span className="h-1 w-1 rounded-full bg-(--secondary)" />
                <span>#travelwithWayloft</span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-(--primary) md:text-5xl">
                Plan your trip
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--muted) md:text-base">
                Fill this once and we’ll receive your request instantly by email.
              </p>
            </div>

            <Link
              href="/"
              className="hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/5 md:inline"
            >
              Back home
            </Link>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          className="mx-auto max-w-3xl rounded-3xl bg-white p-5 ring-1 ring-black/10 md:p-7"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Your name" placeholder="Revanth" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="Email" placeholder="you@email.com" value={form.email} onChange={(v) => update("email", v)} />
            <Field label="WhatsApp" placeholder="+44..." value={form.whatsapp} onChange={(v) => update("whatsapp", v)} />
            <Field label="From city" placeholder="London" value={form.fromCity} onChange={(v) => update("fromCity", v)} />
            <Field label="Destination" placeholder="Paris / Dubai / Bali..." value={form.destination} onChange={(v) => update("destination", v)} />
            <Field label="Dates" placeholder="11 Jan – 14 Jan" value={form.dates} onChange={(v) => update("dates", v)} />
            <Field label="Duration" placeholder="3 nights" value={form.duration} onChange={(v) => update("duration", v)} />
            <Field label="Budget" placeholder="£800–£1200 per person" value={form.budget} onChange={(v) => update("budget", v)} />
            <Field label="Travellers" placeholder="2" value={form.travelers} onChange={(v) => update("travelers", v)} />
          </div>

          <Divider />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-(--primary)">Travel style</div>
              <p className="mt-1 text-xs text-(--muted)">Pick what you want it to feel like.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((opt) => {
                  const active = form.style.includes(opt);
                  return (
                    <Chip key={opt} active={active} onClick={() => update("style", toggle(form.style, opt))}>
                      {opt}
                    </Chip>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-(--primary)">Priorities</div>
              <p className="mt-1 text-xs text-(--muted)">What matters most for you.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((opt) => {
                  const active = form.priorities.includes(opt);
                  return (
                    <Chip key={opt} active={active} onClick={() => update("priorities", toggle(form.priorities, opt))}>
                      {opt}
                    </Chip>
                  );
                })}
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <div className="text-sm font-semibold text-(--primary)">Anything else?</div>
            <p className="mt-1 text-xs text-(--muted)">
              Hotels you like, places you want, or anything you want to avoid.
            </p>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="mt-3 min-h-120px w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-(--text) ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-(--secondary)"
              placeholder="Example: Eiffel Tower dinner view, no early mornings, must have aesthetic cafes..."
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={sendRequest}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl bg-(--primary) px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90",
                sending && "opacity-70 pointer-events-none"
              )}
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send request"}
            </button>

            {state === "sent" && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-(--muted)">
                <CheckCircle2 className="h-4 w-4" />
                Sent. You’ll receive this in your email.
              </span>
            )}

            {state === "error" && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {errorMsg || "Something went wrong."}
              </span>
            )}
          </div>

          <div className="mt-4 text-xs text-(--muted)">
            By sending, you agree we can contact you about your trip.
          </div>
        </motion.section>
      </Container>
    </main>
  );
}

function Divider() {
  return <div className="my-5 h-px w-full bg-black/5" />;
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-(--muted)">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-(--text) ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-(--secondary)"
      />
    </label>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-2 text-xs font-semibold ring-1 transition",
        active
          ? "bg-(--primary) text-white ring-black/10"
          : "bg-white text-(--primary) ring-black/10 hover:bg-black/5"
      )}
    >
      {children}
    </button>
  );
}
