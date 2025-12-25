"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  show: boolean;
  onDone: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function IntroLoader({ show, onDone }: Props) {
  const reduce = useReducedMotion();

  // Slightly longer feels cinematic but still snappy
  const durationMs = reduce ? 650 : 2100;

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onDone(), durationMs);
    return () => window.clearTimeout(t);
  }, [show, onDone, durationMs]);

  // Deterministic "stars" so it never re-randomizes
  const stars = useMemo(() => {
    return Array.from({ length: 46 }).map((_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 53) % 100;
      const s = 0.55 + ((i * 29) % 55) / 100; // 0.55..1.1
      const o = 0.12 + ((i * 17) % 55) / 100; // 0.12..0.67
      const d = ((i * 41) % 30) / 10; // 0..3
      return { x, y, s, o, d };
    });
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  // A clean cinematic flight arc across the logo
  // You can tweak this path to taste
  const arc = "M 12 58 C 34 38, 52 32, 72 42 S 94 62, 112 40";

  // Timings (relative)
  const t0 = 0.0;
  const tLogoIn = reduce ? 0.05 : 0.12;
  const tArc = reduce ? 0.1 : 0.28;
  const tType = reduce ? 0.12 : 0.62;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-10000 overflow-hidden"
          initial={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, filter: "blur(0px)", scale: 1.03 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, filter: "blur(0px)", scale: 1.0 }
          }
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, filter: "blur(10px)", scale: 0.99 }
          }
          transition={{ duration: reduce ? 0.25 : 0.75, ease }}
          aria-label="Intro loader"
        >
          {/* Background: pure cinematic black with subtle light physics */}
          <div className="absolute inset-0 bg-black" />

          {/* Soft spotlight + vignette (no blue, no grid) */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.10), transparent 48%), radial-gradient(circle at 20% 70%, rgba(47,128,193,0.10), transparent 55%), radial-gradient(circle at 80% 78%, rgba(255,255,255,0.06), transparent 52%)",
            }}
            animate={
              reduce
                ? {}
                : {
                    opacity: [0.85, 1, 0.9],
                    filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
                  }
            }
            transition={reduce ? undefined : { duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_42%,rgba(0,0,0,0.55)_78%,rgba(0,0,0,0.92)_100%)]" />

          {/* Film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Stars */}
          <div className="pointer-events-none absolute inset-0">
            {stars.map((s, idx) => (
              <motion.div
                key={idx}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${clamp(1.2 * s.s, 1, 2.2)}px`,
                  height: `${clamp(1.2 * s.s, 1, 2.2)}px`,
                  opacity: s.o,
                }}
                animate={
                  reduce
                    ? {}
                    : {
                        opacity: [s.o, clamp(s.o + 0.18, 0, 0.9), s.o],
                        scale: [1, 1.15, 1],
                      }
                }
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 2.8 + (idx % 8) * 0.25,
                        delay: s.d * 0.08,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />
            ))}
          </div>

          {/* Center stage */}
          <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
            <div className="relative w-full max-w-180">
              {/* Logo block */}
              <motion.div
                className="relative mx-auto grid place-items-center"
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.9, ease, delay: tLogoIn }}
              >
                {/* Glow behind logo */}
                <motion.div
                  className="pointer-events-none absolute -inset-12"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 55%, rgba(47,128,193,0.22), transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 58%)",
                    filter: "blur(10px)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0.2 : 0.8, ease, delay: tLogoIn + 0.08 }}
                />

                {/* The logo itself (your PNG) */}
                <motion.div
                  className="relative"
                  initial={reduce ? { opacity: 1 } : { opacity: 0, filter: "blur(10px)", scale: 0.92 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: reduce ? 0.2 : 0.85, ease, delay: tLogoIn + 0.1 }}
                >
                  <img
                    src="/Photoroom_20251224_131641.png"
                    alt="Wayloft Holidays"
                    className="h-125 w-auto select-none md:h-170"
                    draggable={false}
                  />
                </motion.div>

                {/* Flight arc + plane (layered properly: plane in front, trail behind) */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(820px,96vw)] -translate-x-1/2 -translate-y-1/2">
                  {/* Trail behind */}
                  <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    {/* Soft glow undertrail */}
               
                    {/* Main crisp trail (behind plane) */}
                    

                    {/* A second “air” ribbon that catches light */}
                   
                  </svg>

                  {/* Plane in FRONT, following the same arc via CSS motion-path */}
                  <motion.div
                    className="absolute left-0 top-0 h-0 w-0"
                    style={
                      {
                        offsetPath: `path('${arc}')`,
                        WebkitOffsetPath: `path('${arc}')`,
                        offsetRotate: "auto",
                        WebkitOffsetRotate: "auto",
                        zIndex: 5,
                      } as any
                    }
                    initial={reduce ? { opacity: 0 } : { opacity: 0, offsetDistance: "0%" }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, offsetDistance: ["0%", "100%"] }}
                    transition={{ duration: reduce ? 0.2 : 1.15, ease, delay: tArc + 0.06 }}
                  >
                    {/* Plane body (minimal, not lucide icon, looks more “film UI”) */}
                    <div className="-translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        className="relative grid h-9 w-9 place-items-center rounded-xl"
                        initial={reduce ? { scale: 1 } : { scale: 0.9 }}
                        animate={reduce ? { scale: 1 } : { scale: [0.9, 1.02, 1] }}
                        transition={{ duration: reduce ? 0.2 : 0.7, ease }}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          boxShadow:
                            "0 18px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.14)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {/* Tiny “wing” shape using CSS */}
                        <div
                          className="h-4 w-4 rotate-45 rounded-[5px]"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.60))",
                            boxShadow: "0 8px 26px rgba(0,0,0,0.35)",
                            clipPath: "polygon(0 55%, 100% 45%, 55% 100%, 45% 100%)",
                          }}
                        />
                      </motion.div>

                      {/* Heat shimmer behind plane */}
                      {!reduce && (
                        <motion.div
                          className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.55, 0] }}
                          transition={{ duration: 1.15, ease, delay: tArc + 0.06 }}
                          style={{
                            filter: "blur(6px)",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), rgba(47,128,193,0.20), transparent)",
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Cinematic typography (minimal but expensive) */}
              <motion.div
                className="mx-auto -mt-40 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.2 : 0.9, ease, delay: tType }}
              >
                <motion.div
                  className="select-none text-[28px] font-black tracking-[0.22em] text-white md:text-[34px]"
                  initial={reduce ? { opacity: 1 } : { opacity: 0, filter: "blur(10px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: reduce ? 0.2 : 0.75, ease }}
                  style={{
                    textShadow: "0 18px 70px rgba(0,0,0,0.55)",
                  }}
                >
                  
                </motion.div>

                <motion.div
                  className="mt-2 select-none text-[14px] font-semibold tracking-[0.45em] text-white/70 md:text-[15px]"
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6, filter: "blur(8px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduce ? 0.2 : 0.75, ease, delay: reduce ? 0 : 0.08 }}
                >
                  
                </motion.div>

                <motion.div
                  className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0.2 : 0.6, ease, delay: reduce ? 0 : 0.18 }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: "0 20px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/70" />
                  Loading your next trip vibe…
                </motion.div>

                {/* Minimal progress line */}
                <div className="mx-auto mt-5 w-full max-w-95">
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full bg-white/70"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: reduce ? 0.55 : durationMs / 1000, ease }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
