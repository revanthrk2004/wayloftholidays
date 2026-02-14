"use client";

import { Builder } from "@builder.io/react";

import Hero from "@/components/sections/Hero";
import Trips from "@/components/sections/Trips";
import Experiences from "@/components/sections/Experiences";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

// ✅ Prevent double-registering during HMR / Fast Refresh
const w = globalThis as unknown as { __WAYLOFT_BUILDER_REGISTERED__?: boolean };

if (!w.__WAYLOFT_BUILDER_REGISTERED__) {
  w.__WAYLOFT_BUILDER_REGISTERED__ = true;

  Builder.registerComponent(Hero, { name: "Hero" });
  Builder.registerComponent(Trips, { name: "Trips" });
  Builder.registerComponent(Experiences, { name: "Experiences" });
  Builder.registerComponent(About, { name: "About" });
  Builder.registerComponent(Contact, { name: "Contact" });
}
