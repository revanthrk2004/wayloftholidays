"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Header() {
  const { scrollY } = useScroll();
  const bg = useTransform(
    scrollY,
    [0, 120],
    ["rgba(255,255,255,0.62)", "rgba(255,255,255,0.90)"]
  );
  const border = useTransform(
    scrollY,
    [0, 120],
    ["rgba(15,23,42,0.06)", "rgba(15,23,42,0.10)"]
  );
  const shadow = useTransform(
    scrollY,
    [0, 120],
    ["0 0 0 rgba(0,0,0,0)", "0 18px 70px rgba(11,60,111,0.10)"]
  );

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
            <div className="text-sm font-semibold text-(--primary)">
              Wayloft Holidays
            </div>
            <div className="text-xs text-(--muted)">Trips designed around you</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <a
            className="text-sm text-(--muted) hover:text-(--primary) transition-colors"
            href="#trips"
          >
            Trips
          </a>
          <a
            className="text-sm text-(--muted) hover:text-(--primary) transition-colors"
            href="#experiences"
          >
            Experiences
          </a>
          <a
            className="text-sm text-(--muted) hover:text-(--primary) transition-colors"
            href="#about"
          >
            About
          </a>
          <a
            className="text-sm text-(--muted) hover:text-(--primary) transition-colors"
            href="#contact"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          

          <Link
            href="/plan"
            className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90"
          >
            Plan my trip
          </Link>
        </div>
      </Container>
    </motion.header>
  );
}
