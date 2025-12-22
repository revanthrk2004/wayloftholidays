"use client";

import { useEffect, useState } from "react";
import IntroLoader from "@/components/shell/IntroLoader";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // show every time page loads/reloads
    setShowIntro(true);
  }, []);

  return (
    <>
      <IntroLoader show={showIntro} onDone={() => setShowIntro(false)} />
      {children}
    </>
  );
}
