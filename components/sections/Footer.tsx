"use client";

import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-lg font-black text-(--primary)">
              Wayloft Holidays
            </div>
            <p className="mt-3 max-w-xs text-sm text-(--muted)">
              Premium, personalised travel experiences designed around you.
              From luxury escapes to meaningful journeys, we plan it all.
            </p>

            <div className="mt-4 text-xs font-semibold text-(--primary)">
              #travelwithWayloft
            </div>
          </div>

          {/* Explore */}
          <div>
            <div className="text-sm font-semibold text-(--primary)">Explore</div>
            <ul className="mt-4 space-y-2 text-sm text-(--muted)">
              <li><Link href="#trips" className="hover:text-(--primary)">Trips</Link></li>
              <li><Link href="#experiences" className="hover:text-(--primary)">Experiences</Link></li>
              <li><Link href="/plan" className="hover:text-(--primary)">Plan my trip</Link></li>
              <li><Link href="#about" className="hover:text-(--primary)">About us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-sm font-semibold text-(--primary)">Legal</div>
            <ul className="mt-4 space-y-2 text-sm text-(--muted)">
              <li><Link href="/privacy" className="hover:text-(--primary)">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-(--primary)">Cookies Policy</Link></li>
              <li><Link href="/terms" className="hover:text-(--primary)">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer" className="hover:text-(--primary)">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-sm font-semibold text-(--primary)">Contact</div>

            <div className="mt-4 space-y-3 text-sm text-(--muted)">
              <a
                href="mailto:hello@wayloftholidays.com"
                className="flex items-center gap-2 hover:text-(--primary)"
              >
                <Mail className="h-4 w-4" />
                hello@wayloftholidays.com
              </a>

              <a
                href="https://wa.me/XXXXXXXXXX"
                target="_blank"
                className="flex items-center gap-2 hover:text-(--primary)"
              >
                <Phone className="h-4 w-4" />
                WhatsApp Concierge
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
                className="rounded-xl bg-(--light) p-2 text-(--primary) ring-1 ring-black/5 hover:scale-105 transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-(--muted) md:flex-row">
          <div>
            © {new Date().getFullYear()} Wayloft Holidays. All rights reserved.
          </div>
          <div>
            Designed with care · London
          </div>
        </div>
      </div>
    </footer>
  );
}
