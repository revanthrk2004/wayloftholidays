"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

type NavItem = { label: string; href: string; id: string };

export default function Header() {
  const { scrollY } = useScroll();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("trips");

  const nav: NavItem[] = useMemo(
    () => [
      { label: "Trips", href: "#trips", id: "trips" },
      { label: "Experiences", href: "#experiences", id: "experiences" },
      { label: "About", href: "#about", id: "about" },
      { label: "Contact", href: "#contact", id: "contact" },
    ],
    []
  );

  const shellBg = useTransform(
    scrollY,
    [0, 140],
    ["rgba(255,255,255,0.48)", "rgba(255,255,255,0.78)"]
  );
  const shellBorder = useTransform(
    scrollY,
    [0, 140],
    ["rgba(15,23,42,0.08)", "rgba(15,23,42,0.14)"]
  );
  const shellShadow = useTransform(
    scrollY,
    [0, 140],
    ["0 0 0 rgba(0,0,0,0)", "0 24px 80px rgba(11,60,111,0.14)"]
  );
  const shellY = useTransform(scrollY, [0, 140], [10, 0]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 120) setActiveId("trips");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = nav.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];

        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-10% 0px -60% 0px",
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [nav]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const smoothJump = (href: string) => {
    setOpen(false);
    if (!href.startsWith("#")) return;

    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[90] bg-transparent">
      <Container className="relative">
        <motion.div
          style={{
            backgroundColor: shellBg,
            borderColor: shellBorder,
            boxShadow: shellShadow,
            y: shellY,
          }}
          className={[
            "mt-4 rounded-[22px] border backdrop-blur-xl",
            "px-3 py-2 md:px-4",
            "ring-1 ring-white/40",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white/40"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white">
                <Image
                  src="/wayloft-logo.png"
                  alt="Wayloft Holidays"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold text-(--primary)">
                  Wayloft Holidays
                </div>
                <div className="text-xs text-(--muted)">
                  Trips designed around you
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    onClick={() => smoothJump(item.href)}
                    className={[
                      "relative rounded-xl px-3 py-2 text-sm transition",
                      isActive
                        ? "text-(--primary)"
                        : "text-(--muted) hover:text-(--primary)",
                    ].join(" ")}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-white/65 ring-1 ring-black/5"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center justify-center rounded-xl bg-white/50 p-2 ring-1 ring-black/5 hover:bg-white/70 md:hidden"
                aria-label="Open menu"
              >
                {open ? (
                  <X className="h-5 w-5 text-(--primary)" />
                ) : (
                  <Menu className="h-5 w-5 text-(--primary)" />
                )}
              </button>

<Link
  href="/plan"
  className={[
    "group inline-flex items-center gap-2 rounded-xl",
    "bg-(--primary) text-white font-semibold shadow-[0_14px_40px_rgba(11,60,111,0.18)] hover:opacity-95 active:opacity-90",
    "whitespace-nowrap leading-none",         // ✅ stops wrapping + fixes vertical alignment
    "px-3 py-2 text-sm md:px-4 md:py-2",      // ✅ slightly tighter on mobile, same on desktop
    "shrink-0",                               // ✅ prevents squishing in tight space
  ].join(" ")}
>
  Plan my trip
  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
</Link>

            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="md:hidden"
              >
                <div className="mt-3 grid gap-2 rounded-2xl bg-white/55 p-3 ring-1 ring-black/5">
                  {nav.map((item) => {
                    const isActive = item.id === activeId;

                    return (
                      <button
                        key={item.id}
                        onClick={() => smoothJump(item.href)}
                        className={[
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm",
                          isActive
                            ? "bg-white/70 text-(--primary) ring-1 ring-black/5"
                            : "text-(--muted) hover:bg-white/60 hover:text-(--primary)",
                        ].join(" ")}
                      >
                        {item.label}
                        <span className="text-xs text-(--muted)">↵</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </Container>
    </header>
  );
}
