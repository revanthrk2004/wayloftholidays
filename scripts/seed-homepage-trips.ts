import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import path from "path";
import fs from "fs";
import { createClient } from "@sanity/client";
import type { Trip } from "../app/lib/trips-data";
import { trips as LOCAL_TRIPS } from "../app/lib/trips-data";

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

const publicDir = path.join(process.cwd(), "public");

function filePathFromPublicUrl(url: string) {
  const clean = url.startsWith("/") ? url.slice(1) : url;
  return path.join(publicDir, clean);
}

async function uploadImageFromPublic(url: string) {
  const fp = filePathFromPublicUrl(url);
  if (!fs.existsSync(fp)) {
    console.warn(`⚠️ Image not found in /public: ${url}`);
    return null;
  }

  const data = fs.readFileSync(fp);
  const ext = path.extname(fp).toLowerCase();
  const filename = path.basename(fp);

  const asset = await client.assets.upload("image", data, {
    filename,
    contentType:
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".jpeg" || ext === ".jpg"
        ? "image/jpeg"
        : "application/octet-stream",
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

function key() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

async function ensureHomepageDoc() {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="homepage"][0]{ _id }`
  );

  if (existing?._id) return existing._id;

  const created = await client.create({
    _type: "homepage",
    _id: "homepage",
  });

  return created._id as string;
}

async function main() {
  console.log("✅ Seeding homepage trips...");
  const homepageId = await ensureHomepageDoc();

  const seededTrips = [];

  for (const t of LOCAL_TRIPS as Trip[]) {
    console.log(`→ Trip: ${t.slug}`);

    const bg = await uploadImageFromPublic(t.image);
    const thumb = await uploadImageFromPublic(t.thumb);

    const highlights = [];
    for (const h of t.highlights || []) {
      const himg = await uploadImageFromPublic(h.image);
      highlights.push({
        _type: "highlightItem",
        _key: key(),
        name: h.name,
        image: himg ?? undefined,
        description: h.description,
      });
    }

    seededTrips.push({
      _type: "tripItem",
      _key: key(),
      title: t.title,
      slug: t.slug,
      subtitle: t.subtitle,
      image: bg ?? undefined,
      thumb: thumb ?? undefined,
      about: t.about,
      highlights,
    });
  }

  await client
    .patch(homepageId)
    .set({
      tripsHeading: "Trips",
      tripsSubtitle:
        "Tap a destination. The vibe changes instantly. Then hit Explore when it feels right.",
      trips: seededTrips,
    })
    .commit({ autoGenerateArrayKeys: false });

  console.log("✅ Done. Open Studio and refresh Homepage → Trips.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
