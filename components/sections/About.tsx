"use client";

import Container from "@/components/ui/Container";
import type { HomeData, AboutCard } from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Gem, Timer } from "lucide-react";
import { useMemo } from "react";
import { urlFor } from "@/sanity/lib/image";

const ease = [0.16, 1, 0.3, 1] as const;

const wrapV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemV = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease },
  },
};

function iconFromKey(key?: string) {
  if (key === "gem") return <Gem className="h-4 w-4" />;
  if (key === "timer") return <Timer className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

export default function About({ cms }: { cms?: HomeData }) {
  const heading = useMemo(
    () => cms?.aboutHeading?.trim() || "About WayLoft",
    [cms?.aboutHeading]
  );

  const hasBody = Boolean(cms?.aboutBody?.length);

  // Watermark logo image (Studio) fallback to local image
  const watermarkUrl = useMemo(() => {
    if (cms?.aboutWatermarkImage) {
      try {
        return urlFor(cms.aboutWatermarkImage).width(1200).quality(90).url();
      } catch {
        return "";
      }
    }
    return "/wayloft-logo1.png";
  }, [cms?.aboutWatermarkImage]);

  // Watermark opacity (Studio) fallback
  const watermarkOpacity = useMemo(() => {
    const v = cms?.aboutWatermarkOpacity;
    if (typeof v === "number") return v;
    return 0.01;
  }, [cms?.aboutWatermarkOpacity]);

  // Cards (Studio) fallback
  const cards = useMemo(() => {
    const list = (cms?.aboutCards ?? []).filter(
      (c) => c?.label?.trim() && c?.text?.trim()
    ) as AboutCard[];

    if (list.length) return list;

    return [
      { label: "Personal", icon: "sparkles", text: "Built around your taste, pace, and vibe." },
      { label: "Premium", icon: "gem", text: "Stays, routes, and details that feel elevated." },
      { label: "Fast", icon: "timer", text: "Tell us what you want. We handle the thinking." },
    ] as AboutCard[];
  }, [cms?.aboutCards]);

  const footnote = useMemo(
    () => cms?.aboutFootnote?.trim() || "WayLoft standard",
    [cms?.aboutFootnote]
  );

  return (
    <section id="about" className="relative overflow-hidden bg-white py-24">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-(--light) blur-[90px] opacity-70" />
        <div className="absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-(--light) blur-[90px] opacity-70" />
        <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(11,60,111,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,60,111,0.18)_1px,transparent_1px)] bg-size-[72px_72px]" />
      </div>

      <Container className="relative">
        <motion.div
          variants={wrapV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20% 0px" }}
          className="relative"
        >
          {/* watermark logo (Studio editable) */}
          <motion.div
            variants={itemV}
            className="pointer-events-none absolute -top-28 right-[-120px]"
            style={{ opacity: watermarkOpacity }}
          >
            <div className="relative h-[220px] w-[520px] md:h-[560px] md:w-[660px]">
              <Image
                src={watermarkUrl}
                alt=""
                fill
                sizes="660px"
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* heading + text */}
          <motion.div variants={itemV} className="max-w-3xl">
            <h2 className="font-heading text-4xl font-semibold tracking-tight text-(--primary) md:text-5xl">
              {heading}
            </h2>

            <div className="mt-4 text-(--muted) md:text-lg leading-relaxed">
              {hasBody ? (
                <PortableText value={cms!.aboutBody!} />
              ) : (
                <p>
                  WayLoft is built for people who want premium trips without the stress.
                  We plan with taste, structure, and flow so your days feel effortless and beautiful.
                </p>
              )}
            </div>
          </motion.div>

          {/* cards (Studio editable) */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {cards.map((c, idx) => (
              <motion.div
                key={`${c.label}-${idx}`}
                variants={itemV}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group rounded-3xl bg-white/70 p-6 ring-1 ring-black/10 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-(--light) text-(--primary) ring-1 ring-black/5">
                    {iconFromKey(c.icon)}
                  </div>

                  <div className="text-sm font-semibold text-(--primary)">
                    {c.label}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-(--muted)">
                  {c.text}
                </p>

                <div className="mt-5 h-px w-full bg-black/5" />
                <div className="mt-3 text-xs font-semibold text-(--primary) opacity-70">
                  {footnote}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
