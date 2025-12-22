"use client";

import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const containerV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemV = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* cinematic background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-140 w-140 -translate-x-1/2 rounded-full bg-(--light) blur-3xl opacity-80" />
        <div className="absolute -bottom-64 -right-35 h-140 w-140 rounded-full bg-(--light) blur-3xl opacity-80" />
        <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-size-[56px_56px]" />
      </div>

      <Container className="relative py-10 md:py-16">
        <motion.div variants={containerV} initial="hidden" animate="show" className="grid items-center gap-10 lg:grid-cols-2">
          {/* left */}
          <div>
            <motion.div variants={itemV} className="inline-flex items-center gap-2 rounded-full bg-(--light) px-4 py-2 text-xs font-semibold text-(--primary) ring-1 ring-black/5">
              <span>Wayloft Signature</span>
              <span className="h-1 w-1 rounded-full bg-(--secondary)" />
              <span>#travelwithWayloft</span>
            </motion.div>

            <motion.h1 variants={itemV} className="mt-5 text-4xl font-black tracking-tight text-(--primary) md:text-6xl">
              Your next holiday, designed around you.
            </motion.h1>

            <motion.p variants={itemV} className="mt-4 max-w-xl text-base leading-relaxed text-(--muted) md:text-lg">
              Premium itineraries, unforgettable stays, and zero stress planning.
              Tell us your vibe, budget, and dates, and we craft a trip that actually feels like you.
            </motion.p>

            <motion.div variants={itemV} className="mt-6 flex flex-wrap items-center gap-3">
              <button className="group inline-flex items-center gap-2 rounded-2xl bg-(--primary) px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(11,60,111,0.25)] hover:opacity-95 active:opacity-90">
                Start planning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/2">
                <Play className="h-4 w-4" />
                Watch intro
              </button>
            </motion.div>

            <motion.div variants={itemV} className="mt-6 flex flex-wrap gap-3 text-xs text-(--muted)">
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-black/5">Custom itineraries</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-black/5">Luxury stays</span>
              <span className="rounded-full bg-white px-3 py-2 ring-1 ring-black/5">24/7 WhatsApp support</span>
            </motion.div>
          </div>

          {/* right: video card */}
          <motion.div variants={itemV} className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-(--light) blur-2xl opacity-70" />

            <motion.div
              whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
              transition={{ duration: 0.45, ease }}
              className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-[0_30px_80px_rgba(11,60,111,0.18)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="aspect-video w-full">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/intro-poster.jpg"
                >
                  <source src="/intro.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="flex items-center justify-between gap-0 p-0">
                <div className="text-sm font-semibold text-(--primary)"></div>
                <div className="text-xs text-(--muted)"></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
