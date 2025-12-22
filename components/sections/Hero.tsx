"use client";

import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, ShieldCheck, Star } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const containerV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const itemV = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-[78vh] overflow-hidden">
      {/* VIDEO BACKGROUND */}
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

        {/* darken + color wash so text is readable */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(47,128,193,0.35),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(11,60,111,0.55),transparent_55%)]" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.20)_1px,transparent_1px)] bg-size-[56px_56px]" />

        {/* bottom fade for premium look */}
        <div className="absolute inset-x-0 bottom-0 h-40 background-gradient-to-t from-black/60 to-transparent" />
      </div>

      <Container className="relative py-12 md:py-20">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* LEFT: copy */}
          <div>
            <motion.div
              variants={itemV}
              className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur"
            >
              <Sparkles className="h-4 w-4 text-white/90" />
              <span>Wayloft Signature</span>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>#travelwithWayloft</span>
            </motion.div>

            <motion.h1
              variants={itemV}
              className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl"
            >
              Your next holiday, designed around you.
            </motion.h1>

            <motion.p
              variants={itemV}
              className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg"
            >
              Premium itineraries, unforgettable stays, and zero stress planning.
              Tell us your vibe, budget, and dates and we craft a trip that actually feels like you.
            </motion.p>

            <motion.div variants={itemV} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/plan"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-(--primary) shadow-[0_18px_60px_rgba(0,0,0,0.25)] hover:opacity-95 active:opacity-90"
              >
                Start planning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#intro"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur hover:bg-white/14"
              >
                <Play className="h-4 w-4" />
                Watch intro
              </a>
            </motion.div>

            <motion.div variants={itemV} className="mt-7 flex flex-wrap gap-2 text-xs text-white/80">
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur">
                Custom itineraries
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur">
                Luxury stays
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur">
                24/7 WhatsApp support
              </span>
            </motion.div>
          </div>

          {/* RIGHT: premium “trust” card */}
          <motion.div variants={itemV} className="lg:justify-self-end">
            <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/15">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white">Premium planning</div>
                  <div className="text-xs text-white/75">Not a generic package site</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-white/90" />
                  <div>
                    <div className="text-xs font-semibold text-white">Safety-first suggestions</div>
                    <div className="text-xs text-white/75">
                      We design around comfort, logistics, and your priorities.
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <div className="text-xs font-semibold text-white">Best next step</div>
                  <div className="mt-1 text-xs text-white/75">
                    Click <span className="font-semibold text-white">Start planning</span> and we’ll auto-fill your request into the concierge.
                  </div>
                </div>
              </div>

              <div id="intro" className="mt-4 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white">Intro section anchor</div>
                <div className="mt-1 text-xs text-white/75">
                  This is where we’ll later plug your “watch intro” modal if you want.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
