import type { Metadata } from "next";
import "./globals.css";

import ClientShell from "@/components/shell/ClientShell";
import Footer from "@/components/sections/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import ChatWidget from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  title: "Wayloft Holidays | Trips designed around you",
  description:
    "Premium, personalised trips designed around you. Tell us your vibe, budget, and dates and we’ll craft your perfect holiday.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>
          {children}
          <Footer />
          <CookieBanner />
          <ChatWidget />
        </ClientShell>
      </body>
    </html>
  );
}
