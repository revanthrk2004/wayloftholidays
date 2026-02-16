"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import IntroLoader from "@/components/shell/IntroLoader";
import Header from "@/components/sections/Header";

import "@/app/lib/builder-registry";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const pathname = usePathname();

  const isStudio = pathname?.startsWith("/studio");

  useEffect(() => {
    // ✅ Don’t run intro loader in Studio
    if (isStudio) {
      setShowIntro(false);
      return;
    }
    setShowIntro(true);
  }, [isStudio]);

  return (
    <>
      {/* ✅ Hide intro + header inside /studio */}
      {!isStudio && (
        <>
          <IntroLoader show={showIntro} onDone={() => setShowIntro(false)} />
          <Header />
        </>
      )}

      {/* ✅ Only push down when header exists */}
      <main className={!isStudio ? "pt-[88px]" : undefined}>{children}</main>
    </>
  );
}
