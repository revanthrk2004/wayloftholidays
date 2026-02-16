import type { Metadata } from "next";
import "./globals.css";

import ClientShell from "@/components/shell/ClientShell";

import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "WayLoft Holidays | Trips designed around you",
  description:
    "Premium, personalised trips designed around you. Tell us your vibe, budget, and dates and we’ll craft your perfect holiday.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lora.variable}>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
