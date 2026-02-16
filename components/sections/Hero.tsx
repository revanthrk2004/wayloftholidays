"use client";

import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useMemo, useState } from "react";
import IntroModal from "@/components/shell/IntroModal";

import type { HomeData } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

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

function getFileUrl(file: any): string {
  const url = file?.asset?.url;
  if (typeof url === "string" && url.length) return url;
  if (typeof file === "string" && file.length) return file;
  return "";
}

export default function Hero({ cms }: { cms?: HomeData }) {
  const [openIntro, setOpenIntro] = useState(false);

  const heroTitle = useMemo(() => {
    return (cms?.heroTitle?.trim() || "Travel,\nwithout the stress.").trim();
  }, [cms?.heroTitle]);

  const heroSubtitle = useMemo(() => {
    return (
      cms?.heroSubtitle?.trim() ||
      "We design premium trips around how you actually want to travel. No generic packages. No guesswork. Just trips that feel right."
    );
  }, [cms?.heroSubtitle]);

  const poster = useMemo(() => {
    if (cms?.heroPoster) return urlFor(cms.heroPoster).width(1800).quality(85).url();
    return "/intro-poster.jpg";
  }, [cms?.heroPoster]);

  const videoSrc = useMemo(() => {
    const cmsVideo = getFileUrl(cms?.heroVideo);
    return cmsVideo || "/intro.mp4";
  }, [cms?.heroVideo]);

  const parts = heroTitle.split("\n").map((s) => s.trim()).filter(Boolean);
  const line1 = parts[0] ?? "Travel,";
  const line2 = parts[1]; // optional

  // ✅ RIGHT BOX from CMS with fallbacks
  const rightEyebrow = (cms?.heroRightEyebrow || "Why WayLoft").trim();
  const rightTitle = (cms?.heroRightTitle || "Designed for people who care how they travel").trim();

  const rightItems =
    (cms?.heroRightItems && cms.heroRightItems.length
      ? cms.heroRightItems
      : [
          { title: "No templates", desc: "Every trip starts from scratch, built around you." },
          { title: "Taste over trends", desc: "We optimise for comfort, beauty, and flow." },
          { title: "One clear next step", desc: "Tell us what you want. We do the thinking." },
        ]
    ).filter((x) => x?.title?.trim());

  return (
    <section className="relative min-h-[99vh] overflow-hidden -mt-22">
      <div className="absolute inset-x-0 top-0 h-28 bg-black" />

      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/70" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      <Container className="relative flex min-h-[92vh] items-center pt-[96px]">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="grid w-full items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]"
        >
          {/* LEFT */}
          <div className="relative">
            <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-[120px]" />

            <motion.h1
              variants={itemV}
              className="mt-8 max-w-2xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl"
            >
              {line1}
              {line2 ? <span className="block text-white/70">{line2}</span> : null}
            </motion.h1>

            <motion.p
              variants={itemV}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div variants={itemV} className="mt-10 flex flex-wrap items-center gap-4">
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
          </div>

          {/* RIGHT */}
          <motion.div
            variants={itemV}
            className="relative rounded-[28px] bg-white/10 p-8 ring-1 ring-white/15 backdrop-blur-sm -translate-y-8 md:-translate-y-0"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {rightEyebrow}
            </div>

            <div className="mt-2 text-xl font-semibold text-white">{rightTitle}</div>

            <div className="mt-8 space-y-6">
              {rightItems.map((x) => (
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
