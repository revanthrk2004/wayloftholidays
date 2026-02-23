import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

async function main() {
  // 🔥 fetch homepage doc ID dynamically
  const homepage = await client.fetch<{ _id: string } | null>(`
    *[_type=="homepage"][0]{ _id }
  `);

  if (!homepage?._id) {
    console.log("❌ No homepage document found.");
    return;
  }

  await client
    .patch(homepage._id)
    .unset(["aboutWatermarkOpacity"])
    .commit();

  console.log("✅ Removed aboutWatermarkOpacity from:", homepage._id);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});