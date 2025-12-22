import type { Metadata } from "next";
import PlanClient from "././PlanClient";

export const metadata: Metadata = {
  title: "Plan Your Trip | Wayloft Holidays",
  description:
    "Tell us your dates, budget, and vibe. We will craft a personalised itinerary around you.",
};

export default function PlanPage() {
  return <PlanClient />;
}
