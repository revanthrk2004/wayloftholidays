"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import IntroLoader from "@/components/shell/IntroLoader";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import ChatWidget from "@/components/ai/ChatWidget";

import "@/app/lib/builder-registry";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const pathname = usePathname() || "/";

  const isStudio = pathname.startsWith("/studio");
  const isPlan = pathname.startsWith("/plan");
  const isTripDetail = pathname.startsWith("/trips/"); // /trips/[slug]

  // ✅ Header/Footer only on homepage (you can expand later if you want)
  const showChrome = pathname === "/" && !isStudio;

  // ✅ Chat on homepage + plan + trip detail (not in studio)
  const showChat = !isStudio && (pathname === "/" || isPlan || isTripDetail);

  useEffect(() => {
    if (isStudio) {
      setShowIntro(false);
      return;
    }
    // ✅ only show intro on homepage
    setShowIntro(pathname === "/");
  }, [isStudio, pathname]);

  return (
    <>
      {/* ✅ Intro only on homepage */}
      {!isStudio && pathname === "/" && (
        <IntroLoader show={showIntro} onDone={() => setShowIntro(false)} />
      )}

      {/* ✅ Header only on homepage */}
      {showChrome && <Header />}

      {/* ✅ Only push down when header exists */}
      <main className={showChrome ? "pt-[88px]" : undefined}>{children}</main>

      {/* ✅ Footer/Cookies only on homepage */}
      {showChrome && <Footer />}
      {showChrome && <CookieBanner />}

      {/* ✅ ChatWidget on / + /plan + /trips/[slug] */}
      {showChat && <ChatWidget />}
    </>
  );
}
