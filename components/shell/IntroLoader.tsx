"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Props = {
  show: boolean;
  onDone: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function IntroLoader({ show, onDone }: Props) {
  const reduce = useReducedMotion();
  const durationMs = reduce ? 750 : 2200;

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onDone(), durationMs);
    return () => window.clearTimeout(t);
  }, [show, onDone, durationMs]);

  // ultra-subtle dust particles (minimal but premium depth)
  const dust = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const x = (i * 47) % 100;
      const y = (i * 61) % 100;
      const s = 0.55 + ((i * 23) % 45) / 100;
      const o = 0.06 + ((i * 11) % 14) / 100;
      const d = ((i * 29) % 30) / 10;
      return { x, y, s, o, d };
    });
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Intro loader"
        >
          {/* soft luxury aurora */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(47,128,193,0.14), transparent 62%), radial-gradient(circle at 18% 20%, rgba(11,60,111,0.08), transparent 55%), radial-gradient(circle at 85% 75%, rgba(47,128,193,0.08), transparent 58%)",
            }}
            animate={
              reduce
                ? {}
                : {
                    backgroundPosition: [
                      "0% 0%, 0% 0%, 0% 0%",
                      "18% 10%, -10% 12%, 10% -12%",
                      "0% 0%, 0% 0%, 0% 0%",
                    ],
                    opacity: [0.85, 1, 0.85],
                  }
            }
            transition={
              reduce
                ? undefined
                : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* subtle grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(11,60,111,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,60,111,0.10)_1px,transparent_1px)] bg-[length:26px_26px]" />

          {/* noise */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
            }}
          />

          {/* micro dust */}
          <div className="pointer-events-none absolute inset-0">
            {dust.map((p, idx) => (
              <motion.div
                key={idx}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: p.o,
                  transform: `scale(${p.s})`,
                  background: "rgba(11,60,111,0.22)",
                }}
                animate={
                  reduce
                    ? {}
                    : {
                        y: [0, -10 - idx * 0.15, 0],
                        opacity: [p.o, clamp(p.o + 0.08, 0, 0.22), p.o],
                      }
                }
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 3.2 + (idx % 6) * 0.22,
                        delay: p.d * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />
            ))}
          </div>

          {/* center */}
          <div className="relative flex min-h-screen items-center justify-center px-6">
            <div className="relative grid place-items-center">
              {/* halo wrapper */}
              <div className="relative grid place-items-center">
                {/* conic halo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: "min(440px, 86vw)",
                    height: "min(440px, 86vw)",
                    background:
                      "conic-gradient(from 180deg, rgba(47,128,193,0.00), rgba(47,128,193,0.22), rgba(11,60,111,0.14), rgba(47,128,193,0.00))",
                    filter: "blur(0px)",
                    opacity: 0.95,
                    maskImage:
                      "radial-gradient(circle, transparent 55%, black 68%)",
                    WebkitMaskImage:
                      "radial-gradient(circle, transparent 55%, black 68%)",
                  }}
                  initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : {
                          opacity: 1,
                          scale: [0.98, 1.02, 0.98],
                          rotate: 360,
                        }
                  }
                  transition={
                    reduce
                      ? { duration: 0.2 }
                      : {
                          opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                          scale: {
                            duration: 4.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          rotate: {
                            duration: 7.5,
                            repeat: Infinity,
                            ease: "linear",
                          },
                        }
                  }
                />

                {/* shimmer sweep */}
                {!reduce && (
                  <motion.div
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: "min(440px, 86vw)",
                      height: "min(440px, 86vw)",
                      maskImage:
                        "radial-gradient(circle, transparent 60%, black 72%)",
                      WebkitMaskImage:
                        "radial-gradient(circle, transparent 60%, black 72%)",
                      background:
                        "linear-gradient(110deg, transparent 0%, rgba(11,60,111,0.10) 45%, transparent 70%)",
                      opacity: 0.9,
                    }}
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: 360, opacity: [0, 1, 0] }}
                    transition={{
                      rotate: { duration: 2.4, repeat: Infinity, ease: "linear" },
                      opacity: {
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  />
                )}

                {/* logo 3D spin (minimal but premium) */}
                <motion.div
                  className="relative grid place-items-center rounded-full"
                  style={{
                    width: "min(280px, 70vw)",
                    height: "min(280px, 70vw)",
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(11,60,111,0.12)",
                    boxShadow: "0 40px 140px rgba(11,60,111,0.10)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    transformStyle: "preserve-3d",
                    perspective: 900,
                  }}
                  initial={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.92, y: 10, filter: "blur(10px)" }
                  }
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : {
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          rotateX: [6, -6, 6],
                          rotateY: [-8, 8, -8],
                          scale: [0.985, 1.02, 0.985],
                        }
                  }
                  transition={
                    reduce
                      ? { duration: 0.2 }
                      : {
                          opacity: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                          filter: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                          rotateX: {
                            duration: 3.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          rotateY: {
                            duration: 4.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 3.0,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }
                  }
                >
                  {/* inner glow */}
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_25%,rgba(47,128,193,0.18),transparent_58%)]" />
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_75%_78%,rgba(11,60,111,0.10),transparent_58%)]" />

                  <motion.img
                    src="/Photoroom_20251224_131642.png"
                    alt="WayLoft Holidays"
                    draggable={false}
                    className="relative h-32 w-auto select-none md:h-40 lg:h-48"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: reduce ? 0.2 : 0.7,
                      delay: reduce ? 0 : 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </motion.div>
              </div>

              {/* minimal progress */}
           
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}