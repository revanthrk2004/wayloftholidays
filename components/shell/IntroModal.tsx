"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function IntroModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-80 grid place-items-center bg-black/70 p-4"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-black ring-1 ring-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/15"
              aria-label="Close intro"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video w-full">
              <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="flex items-center justify-between gap-3 bg-black px-5 py-4">
              <div className="text-sm font-semibold text-white">Wayloft Intro</div>
              <div className="text-xs text-white/60">
                Tip: Replace /public/intro.mp4 anytime
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
