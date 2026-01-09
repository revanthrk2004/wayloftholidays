"use client";

import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Camera, MapPinned, UtensilsCrossed, Compass, ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const containerV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemV = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease } },
};

type Card = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export default function Experiences() {
  const cards: Card[] = [
    {
      title: "Private dining with a view",
      desc: "Rooftops, hidden courtyards, and candlelit corners chosen around your taste.",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
    {
      title: "Curated neighbourhood walks",
      desc: "Slow routes with cafés, side streets, and natural pauses that feel effortless.",
      icon: <MapPinned className="h-4 w-4" />,
    },
    {
      title: "Local guide experiences",
      desc: "Small-group moments that reveal stories you won’t find in guidebooks.",
      icon: <Compass className="h-4 w-4" />,
    },
    {
      title: "Photo-first day plans",
      desc: "Golden-hour timing, clean backdrops, and beautifully paced days.",
      icon: <Camera className="h-4 w-4" />,
    },
  ];

  return (
    <section id="experiences" className="relative py-24 bg-white overflow-hidden">
      {/* soft background accents (not too loud) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-(--light) blur-[90px] opacity-70" />
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-(--light) blur-[90px] opacity-70" />
        <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(11,60,111,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,60,111,0.18)_1px,transparent_1px)] bg-size-[68px_68px]" />
      </div>

      <Container className="relative">
        <motion.div variants={containerV} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-20% 0px" }}>
          {/* Header row */}
          <motion.div variants={itemV} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-heading text-4xl font-semibold tracking-tight text-(--primary)">
                Experiences
              </h2>
              <p className="mt-3 text-(--muted) md:text-lg">
                Aesthetic cafés, iconic spots, hidden gems, and experiences that feel personal.
              </p>
            </div>

            {/* small soft CTA (optional, looks premium) */}
            <a
              href="#trips"
              className="group inline-flex w-fit items-center gap-2 rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-(--primary) ring-1 ring-black/10 backdrop-blur-xl hover:bg-white"
            >
              Explore trips
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          {/* Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {cards.map((c) => (
              <motion.div
                key={c.title}
                variants={itemV}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={[
                  "group relative overflow-hidden rounded-3xl",
                  "bg-white/65 ring-1 ring-black/10 backdrop-blur-xl",
                  "p-6 md:p-7",
                ].join(" ")}
              >
                {/* soft hover sheen */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-(--light) blur-[60px] opacity-70" />
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-(--light) text-(--primary) ring-1 ring-black/5">
                    {c.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="font-heading text-lg font-semibold text-(--primary)">
                      {c.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                      {c.desc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-(--primary) opacity-70">
                      Built around your vibe
                      <span className="h-1 w-1 rounded-full bg-(--primary)/40" />
                      No templates
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
