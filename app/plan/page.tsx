import type { Metadata } from "next";
import PlanClient from "././PlanClient";

export const metadata: Metadata = {
  title: "Plan Your Trip | WayLoft Holidays",
  description:
    "Tell us your dates, budget, and vibe. We will craft a personalised itinerary around you.",
};

export default function PlanPage() {
  return <PlanClient />;
}
