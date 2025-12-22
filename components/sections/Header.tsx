"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

export default function Header() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0.62)", "rgba(255,255,255,0.86)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(15,23,42,0.06)", "rgba(15,23,42,0.10)"]);
  const shadow = useTransform(scrollY, [0, 120], ["0 0 0 rgba(0,0,0,0)", "0 18px 70px rgba(11,60,111,0.10)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border, boxShadow: shadow }}
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-black/10 bg-white">
            <Image
              src="/wayloft-logo.png"
              alt="Wayloft Holidays"
              fill
              className="object-cover"
              priority
            />
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

          <Link
            href="/plan"
            className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90"
          >
            Plan my trip
          </Link>
        </div>
      </Container>

      {/* Search row (we’ll wire this later to open chat) */}
      <div className="border-t border-black/5">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden text-xs text-(--muted) md:flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-(--secondary)" />
              <span>Tell us your travel plans — we’ll design the perfect trip.</span>
            </div>

            <div className="w-full md:max-w-3xl">
              <div className="flex w-full overflow-hidden rounded-2xl bg-white/80 ring-1 ring-black/10 backdrop-blur shadow-[0_10px_30px_rgba(11,60,111,0.10)]">
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
