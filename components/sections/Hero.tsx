"use client";

import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import IntroModal from "@/components/shell/IntroModal";

const ease = [0.16, 1, 0.3, 1] as const;

const containerV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemV = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease },
  },
};

export default function Hero() {
  const [openIntro, setOpenIntro] = useState(false);

  return (
    <section className="relative min-h-[99vh] overflow-hidden -mt-22">
      {/* ✅ fills the top behind the floating header so no white shows */}
<div className="absolute inset-x-0 top-0 h-28 bg-black" />

      {/* ===== Background (covers BEHIND the fixed header too) ===== */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover object-top"

          autoPlay
          muted
          loop
          playsInline
          poster="/intro-poster.jpg"
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>

        {/* cinematic layers */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/70" />

        {/* ✅ extra top blend so header area never looks “white” */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      {/* ===== Content ===== */}
      {/* ✅ padding-top pushes content below your fixed header */}
      <Container className="relative flex min-h-[92vh] items-center pt-[96px]">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="grid w-full items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]"
        >
          {/* ===== LEFT ===== */}
          <div className="relative">
            <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-[120px]" />

            <motion.div
             
            >
              
            </motion.div>

            <motion.h1
              variants={itemV}
              className="mt-8 max-w-2xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl"
            >
              Travel,
              <span className="block text-white/70">without the stress.</span>
            </motion.h1>

            <motion.p
              variants={itemV}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
            >
              We design premium trips around how you actually want to travel. No
              generic packages. No guesswork. Just trips that feel right.
            </motion.p>

            <motion.div
              variants={itemV}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/plan"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-(--primary) shadow-[0_20px_70px_rgba(0,0,0,0.35)] hover:opacity-95"
              >
                Start planning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => setOpenIntro(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-7 py-4 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/15"
              >
                <Play className="h-4 w-4" />
                Watch intro
              </button>
            </motion.div>

            <motion.div
              variants={itemV}
              className="mt-10 flex flex-wrap gap-3 text-xs text-white/75"
            >
              
            </motion.div>
          </div>

          {/* ===== RIGHT ===== */}
<motion.div
  variants={itemV}
  className="relative rounded-[28px] bg-white/10 p-8 ring-1 ring-white/15 backdrop-blur-sm
             -translate-y-8 md:-translate-y-0"
>

            <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Why WayLoft
            </div>

            <div className="mt-2 text-xl font-semibold text-white">
              Designed for people who care how they travel
            </div>

            <div className="mt-8 space-y-6">
              {[
                { title: "No templates", desc: "Every trip starts from scratch, built around you." },
                { title: "Taste over trends", desc: "We optimise for comfort, beauty, and flow." },
                { title: "One clear next step", desc: "Tell us what you want. We do the thinking." },
              ].map((x) => (
                <div key={x.title} className="border-l border-white/20 pl-4">
                  <div className="font-semibold text-white">{x.title}</div>
                  <div className="mt-1 text-sm text-white/75">{x.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>

      <IntroModal open={openIntro} onClose={() => setOpenIntro(false)} />
    </section>
  );
}
