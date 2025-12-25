"use client";

import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import IntroModal from "@/components/shell/IntroModal";

const ease = [0.16, 1, 0.3, 1] as const;

const containerV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemV = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

export default function Hero() {
  const [openIntro, setOpenIntro] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* FULL VIDEO BACKGROUND */}
      <div className="absolute inset-0">
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

        {/* Darken + soften for readability */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 [bg-gradient-to-b] from-black/50 via-black/35 to-black/65" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[56px_56px]" />
      </div>

      <Container className="relative py-16 md:py-24">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          {/* LEFT TEXT */}
          <div>
            <motion.div
              variants={itemV}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl"
            >
              
              <span>#travelwithWayloft</span>
            </motion.div>

            <motion.h1
              variants={itemV}
              className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl"
            >
              Your next holiday, designed around you.
            </motion.h1>

            <motion.p
              variants={itemV}
              className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            >
              Premium itineraries, unforgettable stays, and zero-stress planning.
              Tell us your vibe, budget, and dates, and we craft a trip that actually feels like you.
            </motion.p>

            <motion.div variants={itemV} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/plan"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-var(--primary) shadow-[0_18px_60px_rgba(0,0,0,0.25)] hover:opacity-95 active:opacity-90"
              >
                Start planning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <button
                onClick={() => setOpenIntro(true)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/15"
              >
                <Play className="h-4 w-4" />
                Watch intro
              </button>
            </motion.div>

            <motion.div variants={itemV} className="mt-7 flex flex-wrap gap-3 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-xl">
                Custom itineraries
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-xl">
                Luxury stays
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-xl">
                24/7 WhatsApp support
              </span>
            </motion.div>
          </div>

          {/* RIGHT GLASS CARD */}
          <motion.div
            variants={itemV}
            className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-xl"
          >
            <div className="text-sm font-semibold text-white">Why Wayloft feels different</div>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-semibold text-white">Premium planning</div>
                <div className="mt-1 text-xs text-white/75">
                  Not a generic package site. Built around your taste.
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-semibold text-white">Safety-first suggestions</div>
                <div className="mt-1 text-xs text-white/75">
                  Designed around comfort, logistics, and your priorities.
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-semibold text-white">Best next step</div>
                <div className="mt-1 text-xs text-white/75">
                  Click Start planning and we’ll prefill your request into the concierge.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      <IntroModal open={openIntro} onClose={() => setOpenIntro(false)} />
    </section>
  );
}
