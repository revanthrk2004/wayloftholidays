"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plane, Sparkles, MapPin } from "lucide-react";

type Props = {
  show: boolean;
  onDone: () => void;
};

export default function IntroLoader({ show, onDone }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => onDone(), reduce ? 650 : 1400);
    return () => window.clearTimeout(t);
  }, [show, onDone, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-999 overflow-hidden bg-(--primary)"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.25 : 0.45 }}
          aria-label="Intro loader"
        >
          {/* soft grid + vignette */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[28px_28px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(47,128,193,0.45),transparent_58%)]" />
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle,black_58%,transparent_74%)] bg-black/25" />

          <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
            <div className="relative w-full max-w-xl">
              {/* orbit stage */}
              <div className="relative mx-auto grid aspect-square w-[min(430px,90vw)] place-items-center">
                {/* ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/18"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduce ? 0.3 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="absolute inset-[12%] rounded-full border border-white/10"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduce ? 0.3 : 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* "earth" */}
                <motion.div
                  className="relative grid h-[58%] w-[58%] place-items-center overflow-hidden rounded-full bg-white/8 ring-1 ring-white/12"
                  initial={{ y: 10, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: reduce ? 0.35 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(230,242,250,0.22),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(47,128,193,0.18),transparent_55%)]" />

                  <div className="relative flex flex-col items-center gap-3">
                    <img
                      src="/wayloft-logo.png"
                      alt="Wayloft Holidays"
                      className="h-14 w-14 rounded-2xl bg-white p-2 ring-1 ring-white/20"
                    />
                    <div className="text-center">
                      <div className="text-lg font-black tracking-tight text-white">
                        Wayloft Holidays
                      </div>
                      <div className="mt-1 text-xs font-semibold text-white/75">
                        Trips designed around you
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* orbiting plane */}
                <motion.div
                  className="absolute inset-0"
                  animate={reduce ? {} : { rotate: 360 }}
                  transition={
                    reduce
                      ? undefined
                      : { duration: 2.2, ease: "linear", repeat: Infinity }
                  }
                >
                  <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/18">
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* micro badges */}
                <motion.div
                  className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/18 backdrop-blur"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0.25 : 0.55, delay: 0.08 }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-xs font-semibold text-white/90">AI Concierge</span>
                  <span className="h-1 w-1 rounded-full bg-white/35" />
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-xs font-semibold text-white/90">Premium itineraries</span>
                </motion.div>
              </div>

              {/* bottom caption */}
              <motion.div
                className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 text-center text-xs font-semibold text-white/75"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.55, delay: 0.12 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/18">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/70" />
                  Loading your next trip vibe…
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
