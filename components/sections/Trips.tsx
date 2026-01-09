"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion } from "framer-motion";
import { trips as TRIPS, type Trip } from "@/app/lib/trips-data";

export default function Trips() {
  const trips: Trip[] = useMemo(() => TRIPS, []);
  const [active, setActive] = useState<Trip>(trips[0]);

  // ✅ refs for mobile auto-swipe
  const rowRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // ✅ Hard preload + decode (download + decode early)
  useEffect(() => {
    let cancelled = false;

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        // @ts-ignore
        img.fetchPriority = "high";
        img.decoding = "async";
        img.onload = async () => {
          try {
            // @ts-ignore
            if (img.decode) await img.decode();
          } catch {}
          resolve();
        };
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

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  const scrollActiveIntoView = (index: number) => {
    const row = rowRef.current;
    const el = itemRefs.current[index];
    if (!row || !el) return;

    // Center the tapped card inside the row
    const left =
      el.offsetLeft - (row.clientWidth / 2 - el.clientWidth / 2);

    row.scrollTo({
      left: Math.max(0, left),
      behavior: "smooth",
    });
  };

  const onPickTrip = (t: Trip, index: number) => {
    setActive(t);

    // ✅ mobile only: auto-swipe to the selected card
    if (isMobile()) {
      requestAnimationFrame(() => scrollActiveIntoView(index));
    }
  };

  return (
    <section id="trips" className="py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-(--primary)">
            Trips
          </h2>
          <p className="mt-3 text-(--muted)">
            Tap a destination. The vibe changes instantly. Then hit Explore when it feels right.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[32px] ring-1 ring-black/10">
          {/* ✅ Background layer (ALL images exist, we only fade opacity) */}
          <div className="absolute inset-0">
            {trips.map((t) => {
              const activeNow = t.slug === active.slug;
              return (
                <div
                  key={t.slug}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${t.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: activeNow ? 1 : 0,
                    transition: "opacity 100ms linear", // ✅ faster
                    willChange: "opacity",
                    transform: "translateZ(0)",
                  }}
                />
              );
            })}

            {/* overlays */}
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 [bg-gradient-to-b] from-black/35 via-black/20 to-black/55" />
            <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[56px_56px]" />
          </div>

          {/* ✅ Hidden preload imgs (extra insurance) */}
          <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
            {trips.map((t) => (
              <img key={t.slug} src={t.image} alt="" decoding="async" loading="eager" />
            ))}
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
                  onClick={() => window.dispatchEvent(new Event("WayLoft:open-ai"))}
                  className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-[1px] hover:bg-white/15"
                >
                  Ask WayLoft AI
                </button>
              </div>
            </div>

            {/* RIGHT: tiles */}
            <div
              ref={rowRef}
              className={[
                "gap-3",
                // mobile row scroll
                "flex overflow-x-auto pb-1 pr-2 -mr-2 snap-x snap-mandatory",
                // ✅ smoother scroll on iOS
                "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                // desktop grid
                "sm:grid sm:overflow-visible sm:pb-0 sm:pr-0 sm:mr-0 sm:grid-cols-2",
              ].join(" ")}
            >
              {trips.map((t, idx) => {
                const isActive = t.slug === active.slug;

                return (
                  <motion.button
                    key={t.slug}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    onClick={() => onPickTrip(t, idx)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22, mass: 0.6 }} // ✅ smoother
                    className={[
                      "snap-center shrink-0 w-[78%] sm:w-auto",
                      "group relative overflow-hidden rounded-3xl text-left ring-1 transition",
                      // ✅ less blur than before
                      "backdrop-blur-[0.5px]",
                      isActive
                        ? "bg-white/16 ring-white/30"
                        : "bg-white/10 ring-white/15 hover:bg-white/12",
                      "will-change-transform",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    ].join(" ")}
                  >
                    <div className="p-5">
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-white/80">
                        VISIT
                      </div>

                      <div className="font-heading mt-2 text-2xl font-semibold text-white">
                        {t.title}
                      </div>

                      <div className="mt-2 text-xs leading-relaxed text-white/75">
                        {t.subtitle}
                      </div>
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
