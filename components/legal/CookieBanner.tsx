"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "wayloft_cookie_consent";
const INTRO_DELAY = 2600; // must be slightly longer than IntroLoader duration

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // Step 1: wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 2: check consent AFTER intro loader finishes
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      try {
        const consent = localStorage.getItem(KEY);
        if (!consent) setShow(true);
      } catch {
        // fail-safe: still show banner
        setShow(true);
      }
    }, INTRO_DELAY);

    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted || !show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[92vw] max-w-2xl -translate-x-1/2 rounded-3xl bg-white/90 p-4 backdrop-blur-xl ring-1 ring-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-(--text)">
          We use cookies to improve your experience, analyse traffic, and personalise content.
          <Link
            href="/cookies"
            className="ml-2 font-semibold text-(--primary) hover:underline"
          >
            Cookie policy
          </Link>
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem(KEY, "essential");
              setShow(false);
            }}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/3"
          >
            Essential only
          </button>

          <button
            onClick={() => {
              localStorage.setItem(KEY, "all");
              setShow(false);
            }}
            className="rounded-2xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
