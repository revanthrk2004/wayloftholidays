"use client";

import { useEffect, useState } from "react";
import IntroLoader from "@/components/shell/IntroLoader";
import Header from "@/components/sections/Header";

import "@/app/lib/builder-registry";
export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setShowIntro(true);
  }, []);

  return (
    <>
      <IntroLoader show={showIntro} onDone={() => setShowIntro(false)} />

      {/* ✅ Global header (always visible) */}
      <Header />

      {/* ✅ Push content down so header doesn’t cover it */}
      <main className="pt-[88px]">{children}</main>
    </>
  );
}
