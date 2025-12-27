"use client";

import { useEffect, useMemo, useRef } from "react";
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

  // keep your timing
  const durationMs = reduce ? 650 : 2100;

  // ✅ Prevent double-calls (StrictMode / fast re-renders)
  const doneRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!show) {
      doneRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    doneRef.current = false;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone();
    }, durationMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [show, onDone, durationMs]);

  // Deterministic stars (same as your code)
  const stars = useMemo(() => {
    return Array.from({ length: 46 }).map((_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 53) % 100;
      const s = 0.55 + ((i * 29) % 55) / 100;
      const o = 0.12 + ((i * 17) % 55) / 100;
      const d = ((i * 41) % 30) / 10;
      return { x, y, s, o, d };
    });
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;
  const tLogoIn = reduce ? 0.05 : 0.12;

  // ring sizes
  const ringSize = "min(520px, 92vw)";
  const ringStroke = reduce ? 2.25 : 2.6;

  // ✅ SVG transform helpers (this is the missing part for real rotation)
  const svgSpinStyle: React.CSSProperties = {
    transformOrigin: "50px 50px", // center of viewBox
    transformBox: "fill-box",
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {show && (
        <motion.div
          key="intro-loader"
          className="fixed inset-0 z-10000 overflow-hidden"
          initial={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1.03 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1.0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", scale: 0.99 }}
          transition={{ duration: reduce ? 0.25 : 0.75, ease }}
          aria-label="Intro loader"
        >
          {/* Background: KEEP AS YOU MADE IT */}
          <div className="absolute inset-0 bg-white" />

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
              <motion.div
                className="relative mx-auto grid place-items-center"
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.9, ease, delay: tLogoIn }}
              >
                {/* Glow behind logo (keep your vibe) */}
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

                {/* ✅ LOADING RINGS (NOW ACTUALLY ROTATE) */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: ringSize, height: ringSize }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                      <linearGradient id="wlGradA" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--secondary)" stopOpacity="0.95" />
                        <stop offset="1" stopColor="var(--primary)" stopOpacity="0.95" />
                      </linearGradient>

                      <linearGradient id="wlGradB" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="var(--primary)" stopOpacity="0.95" />
                        <stop offset="1" stopColor="var(--secondary)" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>

                    {/* soft halo ring (static, subtle) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="rgba(47,128,193,0.14)"
                      strokeWidth={ringStroke}
                      opacity={0.55}
                    />

                    {/* Ring 1: rotate clockwise */}
                    <motion.g
                      style={svgSpinStyle}
                      animate={reduce ? {} : { rotate: 360 }}
                      transition={reduce ? undefined : { duration: 2.6, ease: "linear", repeat: Infinity }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="none"
                        stroke="url(#wlGradA)"
                        strokeWidth={ringStroke}
                        strokeLinecap="round"
                        strokeDasharray="18 10"
                        opacity={0.95}
                      />
                    </motion.g>

                    {/* Ring 2: rotate counter-clockwise */}
                    <motion.g
                      style={svgSpinStyle}
                      animate={reduce ? {} : { rotate: -360 }}
                      transition={reduce ? undefined : { duration: 1.95, ease: "linear", repeat: Infinity }}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="28"
                        fill="none"
                        stroke="url(#wlGradB)"
                        strokeWidth={ringStroke}
                        strokeLinecap="round"
                        strokeDasharray="10 14"
                        opacity={0.85}
                      />
                    </motion.g>

                    {/* Ring 3: pulse + dash travel */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(11,60,111,0.40)"
                      strokeWidth={ringStroke - 0.3}
                      strokeLinecap="round"
                      strokeDasharray="4 24"
                      initial={{ opacity: 0 }}
                      animate={
                        reduce
                          ? { opacity: 0.35 }
                          : { opacity: [0.12, 0.38, 0.12], strokeDashoffset: [0, -120] }
                      }
                      transition={reduce ? { duration: 0.25, ease } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>
                </div>

                {/* ✅ Logo: pop from inside + settle + zoom exit */}
                <motion.div
                  className="relative will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={
                    reduce
                      ? { opacity: 1 }
                      : {
                          opacity: 0,
                          filter: "blur(12px)",
                          scale: 0.65,
                          y: 10,
                        }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          filter: "blur(0px)",
                          scale: [0.65, 1.08, 1],
                          y: [10, -2, 0],
                          transition: {
                            duration: 1.05,
                            ease,
                            times: [0, 0.6, 1],
                          },
                        }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 2.6,
                          filter: "blur(18px)",
                          transition: { duration: 0.55, ease },
                        }
                  }
                >
                  <img
                    src="/Photoroom_20251224_131642.png"
                    alt="Wayloft Holidays"
                    className="h-70 w-auto select-none md:h-70"
                    draggable={false}
                  />

                  {!reduce && (
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(110deg, transparent 18%, rgba(255,255,255,0.28) 36%, transparent 54%)",
                        mixBlendMode: "screen",
                        filter: "blur(1px)",
                        opacity: 0,
                      }}
                      animate={{ opacity: [0, 0.22, 0], x: ["-35%", "35%", "70%"] }}
                      transition={{ duration: 1.15, ease, delay: 0.18 }}
                    />
                  )}
                </motion.div>
              </motion.div>

              {/* leaving your typography untouched (still empty) */}
              <motion.div
                className="mx-auto -mt-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.2 : 0.9, ease, delay: reduce ? 0.12 : 0.62 }}
              >
                <motion.div
                  className="select-none text-[28px] font-black tracking-[0.22em] text-white md:text-[34px]"
                  initial={reduce ? { opacity: 1 } : { opacity: 0, filter: "blur(10px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: reduce ? 0.2 : 0.75, ease }}
                  style={{ textShadow: "0 18px 70px rgba(0,0,0,0.55)" }}
                />
                <motion.div
                  className="mt-2 select-none text-[14px] font-semibold tracking-[0.45em] text-white/70 md:text-[15px]"
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6, filter: "blur(8px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduce ? 0.2 : 0.75, ease, delay: reduce ? 0 : 0.08 }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
