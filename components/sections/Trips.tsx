"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { trips as TRIPS, type Trip } from "@/app/lib/trips-data";

export default function Trips() {
  const trips: Trip[] = useMemo(() => TRIPS, []);
  const [active, setActive] = useState<Trip>(trips[0]);

  useEffect(() => {
    let cancelled = false;

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
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
          <div className="absolute inset-0">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={active.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${active.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 [bg-gradient-to-b] from-black/35 via-black/20 to-black/55" />
            <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[56px_56px]" />
          </div>

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
                  onClick={() => {
                    window.dispatchEvent(new Event("WayLoft:open-ai"));
                  }}
                  className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/15"
                >
                  Ask WayLoft AI
                </button>
              </div>
            </div>

            {/* RIGHT: tiles */}
            {/* Mobile: horizontal scroll row (one-screen vibe). Desktop: 2-col grid like before. */}
            <div
              className={[
                "gap-3",
                "flex overflow-x-auto pb-1 pr-2 -mr-2",
                "snap-x snap-mandatory",
                "sm:grid sm:overflow-visible sm:pb-0 sm:pr-0 sm:mr-0 sm:grid-cols-2",
              ].join(" ")}
            >
              {trips.map((t) => {
                const isActive = t.slug === active.slug;

                return (
                  <motion.button
                    key={t.slug}
                    onClick={() => setActive(t)}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className={[
                      // sizing:
                      // mobile: fixed card width so it scrolls horizontally
                      "snap-start shrink-0 w-[78%] xs:w-[70%] sm:w-auto",
                      // base look:
                      "group relative overflow-hidden rounded-3xl text-left ring-1 transition",
                      // ✅ reduced blur here:
                      "backdrop-blur-[1px]",
                      isActive
                        ? "bg-white/16 ring-white/30"
                        : "bg-white/10 ring-white/15 hover:bg-white/12",
                      // focus ring
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    ].join(" ")}
                    animate={{
                      // subtle “selected” motion without changing layout
                      y: isActive ? -2 : 0,
                    }}
                  >
                    {/* subtle animated sheen on hover */}
                    <motion.div
                      className="pointer-events-none absolute -inset-16 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ opacity: 1 }}
                      style={{
                        background:
                          "radial-gradient(closest-side, rgba(255,255,255,0.22), transparent 60%)",
                      }}
                      transition={{ duration: 0.25 }}
                    />

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

                      {/* little “selected” hint (only active) */}
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.18 }}
                            className="mt-3 text-xs font-semibold text-white/90"
                          >
                            Selected
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    {isActive ? (
                      <motion.div
                        layoutId="trip-tile-ring"
                        className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-white/20"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
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
