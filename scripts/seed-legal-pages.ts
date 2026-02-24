import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
const token = process.env.SANITY_API_TOKEN!;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!token) throw new Error("Missing SANITY_API_TOKEN (write token)");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

/* ✅ Sanity arrays need unique _key on every item */
function key() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function span(text: string) {
  return { _type: "span", _key: key(), text, marks: [] as string[] };
}

function block(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [span(text)],
  };
}

function h2(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "h2",
    markDefs: [],
    children: [span(text)],
  };
}

type LegalSeed = {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: any[];
};

const pages: LegalSeed[] = [
  {
    _id: "legal.cookies",
    slug: "cookies",
    title: "Cookies Policy",
    subtitle: "We use cookies to improve your experience and understand site usage.",
    content: [
      h2("What are cookies?"),
      block(
        "Cookies are small files stored on your device. They help websites remember preferences and measure performance."
      ),
      h2("How we use cookies"),
      block(
        "We may use essential cookies for basic site functionality and analytics cookies to understand how visitors use the site."
      ),
      h2("Your choices"),
      block(
        "You can accept or reject non essential cookies using the cookie banner. You can also clear cookies anytime in your browser settings."
      ),
      h2("Contact"),
      block("Cookies questions: support@WayLoftholidays.com"),
    ],
  },
  {
    _id: "legal.disclaimer",
    slug: "disclaimer",
    title: "Disclaimer",
    subtitle: "Important info about the content and recommendations on this website.",
    content: [
      h2("Information only"),
      block(
        "Content on this site is for general information and trip inspiration. It is not financial, legal, or medical advice."
      ),
      h2("Availability and pricing"),
      block(
        "Travel availability and prices can change quickly. Any suggestions are subject to change until confirmed."
      ),
      h2("Third party services"),
      block(
        "We may recommend airlines, hotels, and experiences, but we do not control third party services. Where possible, we will support you if issues arise."
      ),
      h2("Contact"),
      block("Questions: support@WayLoftholidays.com"),
    ],
  },
  {
    _id: "legal.privacy",
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "How we handle your information when you use WayLoft Holidays.",
    content: [
      h2("What we collect"),
      block(
        "When you plan a trip, you may share details like your name, email, WhatsApp number, destination, dates, budget, and preferences."
      ),
      h2("How we use it"),
      block(
        "We use your info to contact you, understand your request, and craft itinerary suggestions. We do not sell your personal data."
      ),
      h2("Third parties"),
      block(
        "If you choose to proceed with bookings, we may share necessary details with airlines, hotels, or partners only to complete that booking."
      ),
      h2("Data retention"),
      block(
        "We keep trip planning requests only as long as needed for support, follow ups, and service improvements."
      ),
      h2("Contact"),
      block("Privacy questions: privacy@WayLoftholidays.com"),
    ],
  },
  {
    _id: "legal.terms",
    slug: "terms",
    title: "Terms of Service",
    subtitle: "These terms explain how the WayLoft Holidays website and trip planning service works.",
    content: [
      h2("Using the site"),
      block(
        "You agree not to misuse the website, attempt to disrupt it, or submit false information."
      ),
      h2("Trip planning"),
      block(
        "Any itineraries or suggestions shared are based on the info you provide and availability at the time. Prices can change."
      ),
      h2("Bookings"),
      block(
        "If we place a booking through partners, their terms may also apply. We will always clarify before confirming anything."
      ),
      h2("Liability"),
      block(
        "We are not responsible for delays, cancellations, or issues caused by third parties (airlines, hotels, etc.). We will help you where we can."
      ),
      h2("Contact"),
      block("Questions: support@WayLoftholidays.com"),
    ],
  },
];

async function main() {
  console.log("✅ Seeding legal pages...");

  for (const p of pages) {
    await client.createOrReplace({
      _type: "legalPage",
      _id: p._id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      content: p.content,
    });

    console.log(`→ Seeded: ${p.slug}`);
  }

  console.log("✅ Done. Open Studio → Legal Page and refresh.");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});