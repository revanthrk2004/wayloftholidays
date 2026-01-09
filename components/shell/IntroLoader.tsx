"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";

type Props = {
  show: boolean;
  onDone: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function splitLetters(word: string) {
  return word.split("").map((ch) => (ch === " " ? "\u00A0" : ch));
}

export default function IntroLoader({ show, onDone }: Props) {
  const reduce = useReducedMotion();

  const durationMs = reduce ? 650 : 1900;

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onDone(), durationMs);
    return () => window.clearTimeout(t);
  }, [show, onDone, durationMs]);

  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 53) % 100;
      const s = 0.55 + ((i * 29) % 45) / 100;
      const d = ((i * 41) % 30) / 10;
      const o = 0.18 + ((i * 17) % 40) / 100;
      return { x, y, s, d, o };
    });
  }, []);

  const rootInitial = reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" };
  const rootExit = reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" };

  const word1 = useMemo(() => splitLetters(""), []);
  const word2 = useMemo(() => splitLetters(""), []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] overflow-hidden bg-white"
          initial={rootInitial as any}
          exit={rootExit as any}
          transition={{ duration: reduce ? 0.25 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Intro loader"
        >
          {/* Light aurora gradients (same vibe but for white bg) */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 18% 18%, rgba(47,128,193,0.18), transparent 55%), radial-gradient(circle at 78% 78%, rgba(11,60,111,0.10), transparent 58%), radial-gradient(circle at 50% 100%, rgba(47,128,193,0.12), transparent 60%), radial-gradient(circle at 90% 30%, rgba(47,128,193,0.10), transparent 55%)",
            }}
            animate={
              reduce
                ? {}
                : {
                    backgroundPosition: [
                      "0% 0%, 0% 0%, 0% 0%, 0% 0%",
                      "18% 8%, -10% 12%, 10% -12%, -8% 10%",
                      "0% 0%, 0% 0%, 0% 0%, 0% 0%",
                    ],
                  }
            }
            transition={reduce ? undefined : { duration: 4.2, ease: "easeInOut", repeat: Infinity }}
          />

          {/* Light grid (blue tinted instead of white) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(11,60,111,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,60,111,0.10)_1px,transparent_1px)] bg-size-[24px_24px]" />

          {/* Noise overlay stays (looks nice on white too) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Particles (dark instead of white for visibility on white bg) */}
          <div className="pointer-events-none absolute inset-0">
            {particles.map((p, idx) => (
              <motion.div
                key={idx}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: p.o,
                  transform: `scale(${p.s})`,
                  background: "rgba(11,60,111,0.35)",
                }}
                animate={
                  reduce
                    ? {}
                    : {
                        y: [0, -12 - idx * 0.2, 0],
                        opacity: [p.o, clamp(p.o + 0.14, 0, 0.65), p.o],
                      }
                }
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 2.7 + (idx % 6) * 0.22,
                        delay: p.d * 0.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />
            ))}
          </div>

          <motion.div
            className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6"
            initial={reduce ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
            animate={
              reduce
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: [0.92, 1.03, 1], y: [12, -6, 0] }
            }
            transition={reduce ? { duration: 0.2 } : { duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-xl">
              <div className="relative mx-auto grid aspect-square w-[min(500px,92vw)] place-items-center">
                {/* Rings (dark-blue tint so visible on white) */}
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: "rgba(11,60,111,0.18)" }}
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduce ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="absolute inset-[10%] rounded-full border"
                  style={{ borderColor: "rgba(47,128,193,0.16)" }}
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduce ? 0.3 : 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Path draw */}
                <svg className="pointer-events-none absolute inset-[6%]" viewBox="0 0 100 100" aria-hidden="true">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(11,60,111,0.18)"
                    strokeWidth="1"
                    strokeDasharray="7 9"
                    initial={{ pathLength: 0 }}
                    animate={reduce ? {} : { pathLength: [0, 1] }}
                    transition={reduce ? undefined : { duration: 1.25, ease: "easeInOut" }}
                  />
                </svg>

                {/* Orb (light glass on white) */}
                <motion.div
                  className="relative grid h-[62%] w-[62%] place-items-center overflow-hidden rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    boxShadow: "0 30px 120px rgba(11,60,111,0.10)",
                    border: "1px solid rgba(11,60,111,0.14)",
                  }}
                  initial={{ y: 18, opacity: 0, scale: 0.94 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: reduce ? 0.35 : 0.95, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_25%,rgba(47,128,193,0.18),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_78%,rgba(11,60,111,0.10),transparent_55%)]" />

                  {/* Shimmer sweep */}
                  {!reduce && (
                    <motion.div
                      className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-[linear-gradient(to_right,transparent,rgba(11,60,111,0.10),transparent)]"
                      animate={{ x: ["-25%", "230%"] }}
                      transition={{ duration: 1.35, ease: "easeInOut" }}
                    />
                  )}

                  <div className="relative flex flex-col items-center gap-1">
                    {/* ✅ IMAGE SIZE: change these classes */}
                    <motion.div
                      className="p-0"
                      style={{
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                      }}

                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: reduce ? 0.25 : 0.6, delay: 0.12 }}
                    >
                      <img
                        src="/Photoroom_20251224_131642.png"
                        alt="WayLoft Holidays"
                        className="h-36 w-auto select-none md:h-44 lg:h-52"
                        draggable={false}
                      />
                    </motion.div>

                    {/* Empty words kept, but now should be dark if you ever add text */}
                    <div className="text-center">
                      <motion.div className="flex justify-center gap-[1px] text-lg font-black tracking-tight text-[var(--primary)]">
                        {word1.map((ch, i) => (
                          <span key={`w1-${i}`} className="inline-block">
                            {ch}
                          </span>
                        ))}
                      </motion.div>

                      <motion.div className="mt-0.5 flex justify-center gap-[1px] text-sm font-black tracking-tight text-[var(--secondary)]">
                        {word2.map((ch, i) => (
                          <span key={`w2-${i}`} className="inline-block">
                            {ch}
                          </span>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Plane orbit (make it visible on white bg) */}
                <motion.div
                  className="absolute inset-0"
                  animate={reduce ? {} : { rotate: 360 }}
                  transition={reduce ? undefined : { duration: 2.35, ease: "linear", repeat: Infinity }}
                >
                  <motion.div
                    className="absolute left-1/2 top-[5%] -translate-x-1/2"
                    animate={reduce ? {} : { y: [0, -4, 0] }}
                    transition={reduce ? undefined : { duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div
                      className="grid h-11 w-11 place-items-center rounded-2xl"
                      style={{
                        background: "rgba(11,60,111,0.06)",
                        border: "1px solid rgba(11,60,111,0.14)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Plane className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Progress */}
              <div className="mx-auto mt-10 w-full max-w-sm">
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(11,60,111,0.08)", border: "1px solid rgba(11,60,111,0.12)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "rgba(47,128,193,0.55)" }}
                    initial={{ width: "10%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: reduce ? 0.55 : durationMs / 1000,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>

                <motion.div
                  className="mx-auto mt-3 flex items-center justify-center text-center text-xs font-semibold"
                  style={{ color: "rgba(11,60,111,0.70)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0.2 : 0.55, delay: 0.12 }}
                >
                  
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
