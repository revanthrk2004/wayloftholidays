"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
} from "framer-motion";

import { trips as TRIPS, type Trip } from "@/app/lib/trips-data";

import type { HomeData, HomeTrip } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

function getImageUrl(img: any) {
  if (!img) return "";
  try {
    return urlFor(img).width(2200).quality(85).url();
  } catch {
    return "";
  }
}

export default function Trips({ cms }: { cms?: HomeData }) {
  const reduceMotion = useReducedMotion();

  // ✅ Use Sanity trips if available, else fallback to local TRIPS
  const trips: Trip[] = useMemo(() => {
    const cmsTrips: HomeTrip[] = cms?.trips?.filter(Boolean) ?? [];

    if (cmsTrips.length) {
      const mapped = cmsTrips
        .map((t) => {
          const slug = String(t.slug ?? "").trim().toLowerCase();

          const image = getImageUrl(t.image);

          if (!slug || !t.title || !image) return null;

          return {
            slug,
            title: t.title,
            subtitle: t.subtitle ?? "",
            image,
          } as Trip;
        })
        .filter(Boolean) as Trip[];

      if (mapped.length) return mapped;
    }

    return TRIPS;
  }, [cms]);

  const [active, setActive] = useState<Trip>(trips[0]);

  // ✅ If trips list changes (CMS loads), reset active safely
  useEffect(() => {
    setActive(trips[0]);
  }, [trips]);

  // ✅ Preload images
  useEffect(() => {
    let cancelled = false;

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    (async () => {
      await Promise.all(trips.map((t) => preload(t.image)));
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [trips]);

  const bgTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

  const tileSpring: Transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 26, mass: 0.7 };

  return (
    <section id="trips" className="py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-(--primary)">
            {cms?.tripsHeading?.trim() || "Trips"}
          </h2>
          <p className="mt-3 text-(--muted)">
            {cms?.tripsSubtitle?.trim() ||
              "Tap a destination. The vibe changes instantly. Then hit Explore when it feels right."}
          </p>
        </div>

        <div className="relative mt-10 overflow-visible rounded-[32px] ring-1 ring-black/10">
          {/* Background */}
          <div className="absolute inset-0">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={active.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={bgTransition}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${active.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  willChange: "opacity",
                }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 [bg-gradient-to-b] from-black/35 via-black/20 to-black/55" />
            <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[56px_56px]" />
          </div>

          {/* Content */}
          <div className="relative grid gap-4 p-5 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            {/* LEFT */}
            <div className="flex flex-col justify-end">
              <div className="inline-flex w-fit items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl">
                VISIT
              </div>

              <h3 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {active.title}
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                {active.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/trips/${active.slug}`}
                  prefetch
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-(--primary) hover:opacity-95"
                >
                  Explore
                </Link>

                <button
                  onClick={() =>
                    window.dispatchEvent(new Event("WayLoft:open-ai"))
                  }
                  className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/15"
                >
                  Ask WayLoft AI
                </button>
              </div>
            </div>

            {/* RIGHT: tiles (mobile stays 2x2, no swipe) */}
            <div className="grid max-h-[420px] overflow-y-auto grid-cols-2 gap-3 pr-2">
              {trips.map((t) => {
                const isActive = t.slug === active.slug;

                return (
                  <motion.button
                    key={t.slug}
                    onClick={() => setActive(t)}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    transition={tileSpring}
                    className={[
                      "group relative overflow-hidden rounded-3xl text-left ring-1",
                      "transition-[background-color,transform] duration-200",
                      "backdrop-blur-[1px]",
                      isActive
                        ? "bg-white/16 ring-white/30"
                        : "bg-white/10 ring-white/15 hover:bg-white/12",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    ].join(" ")}
                    style={{ willChange: "transform" }}
                    aria-pressed={isActive}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="text-[10px] font-semibold tracking-[0.18em] text-white/80">
                        VISIT
                      </div>

                      <div className="font-heading mt-2 text-lg font-semibold text-white sm:text-2xl">
                        {t.title}
                      </div>

                      <div className="mt-2 text-[11px] leading-relaxed text-white/75 sm:text-xs line-clamp-2">
                        {t.subtitle}
                      </div>

                      {isActive ? (
                        <div className="mt-3 text-[11px] font-semibold text-white/90">
                          Selected
                        </div>
                      ) : null}
                    </div>

                    {isActive ? (
                      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-white/20" />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
