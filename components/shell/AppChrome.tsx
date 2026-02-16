"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/sections/Footer";
import CookieBanner from "@/components/legal/CookieBanner";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  return (
    <>
      {children}
      {!isStudio && <Footer />}
      {!isStudio && <CookieBanner />}
    </>
  );
}
