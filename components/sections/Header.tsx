"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

export default function Header() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.88)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(15,23,42,0.06)", "rgba(15,23,42,0.10)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-(--light) ring-1 ring-black/5">
            <span className="text-sm font-black text-(--primary)">W</span>
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-(--primary)">Wayloft Holidays</div>
            <div className="text-xs text-(--muted)">Trips designed around you</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <a className="text-sm text-(--muted) hover:text-(--primary) transition-colors" href="#trips">Trips</a>
          <a className="text-sm text-(--muted) hover:text-(--primary) transition-colors" href="#experiences">Experiences</a>
          <a className="text-sm text-(--muted) hover:text-(--primary) transition-colors" href="#about">About</a>
          <a className="text-sm text-(--muted) hover:text-(--primary) transition-colors" href="#contact">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-(--light) px-3 py-1 text-xs font-semibold text-(--primary) md:inline">
            #travelwithWayloft
          </span>

          <button className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90">
            Plan my trip
          </button>
        </div>
      </Container>

      {/* Search bar row */}
      <div className="border-t border-black/5">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden text-xs text-(--muted) md:flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-(--secondary)" />
              <span>Tell us your travel plans — we’ll design the perfect trip.</span>
            </div>

            <div className="w-full md:max-w-3xl">
              <div className="flex w-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_30px_rgba(11,60,111,0.10)]">
                <div className="flex items-center gap-2 px-4">
                  <Search className="h-5 w-5 text-(--muted)" />
                </div>

                <input
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-(--muted)"
                  placeholder="Tell us your travel plans"
                />

                <button className="h-12 px-6 bg-(--primary) text-white text-sm font-semibold hover:opacity-95 active:opacity-90">
                  SEARCH
                </button>
              </div>
            </div>

            <div className="hidden md:block text-xs text-(--muted)">
              Personalised holidays. Zero stress.
            </div>
          </div>
        </Container>
      </div>
    </motion.header>
  );
}
