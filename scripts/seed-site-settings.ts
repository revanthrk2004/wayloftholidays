import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
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

async function main() {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="siteSettings"][0]{ _id }`
  );

  const doc = {
    _type: "siteSettings",
    _id: existing?._id || "siteSettings",
    brandName: "WayLoft Holidays",
    brandTagline: "Premium, personalised travel experiences designed around you.",
    planButtonText: "Plan my trip",
    footerText:
      "Premium, personalised travel experiences designed around you. From luxury escapes to meaningful journeys, we plan it all.",
    hashtag: "#travelwithWayLoft",
    email: "hello@WayLoftholidays.com",
    whatsappLink: "https://wa.me/XXXXXXXXXX",
    instagramLink: "https://instagram.com",
  };

  await client.createOrReplace(doc);
  console.log("✅ Seeded Site Settings. Open Studio → Site Settings");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});