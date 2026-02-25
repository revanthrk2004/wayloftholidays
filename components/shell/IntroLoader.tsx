"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Props = {
  show: boolean;
  onDone: () => void;
};

export default function IntroLoader({ show, onDone }: Props) {
  const reduce = useReducedMotion();
  const durationMs = reduce ? 700 : 2000;

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onDone(), durationMs);
    return () => window.clearTimeout(t);
  }, [show, onDone, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* VERY SUBTLE PREMIUM BACKGROUND GLOW */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(47,128,193,0.12), transparent 60%)",
            }}
            animate={
              reduce
                ? {}
                : {
                    scale: [1, 1.08, 1],
                    opacity: [0.7, 1, 0.7],
                  }
            }
            transition={
              reduce
                ? undefined
                : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* CENTER CONTENT */}
          <div className="relative flex min-h-screen items-center justify-center px-6">
            <div className="relative flex flex-col items-center">

              {/* LOGO SPIN + BREATH */}
              <motion.img
                src="/Photoroom_20251224_131642.png"
                alt="WayLoft Holidays"
                draggable={false}
                className="h-36 w-auto select-none md:h-44 lg:h-52"
                style={{ transformOrigin: "50% 50%" }}
                initial={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.9, rotate: -8, filter: "blur(10px)" }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        filter: "blur(0px)",
                        rotate: [-8, 8],
                        scale: [0.98, 1.02, 0.98],
                      }
                }
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : {
                        opacity: { duration: 0.8 },
                        filter: { duration: 0.8 },
                        rotate: {
                          duration: 2.4,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "mirror",
                        },
                        scale: {
                          duration: 2.8,
                          ease: "easeInOut",
                          repeat: Infinity,
                        },
                      }
                }
              />

              {/* MINIMAL PROGRESS BAR */}
              <div className="mt-12 w-40 overflow-hidden rounded-full bg-[rgba(11,60,111,0.08)]">
                <motion.div
                  className="h-[2px] bg-[rgba(47,128,193,0.6)]"
                  initial={{ width: "10%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: reduce ? 0.6 : durationMs / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}