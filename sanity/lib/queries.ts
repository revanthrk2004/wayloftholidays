import { sanityClient } from "./client";
import { sanityServerClient } from "./server-client";
/* =========================
   HOMEPAGE TYPES
========================= */
export type HeroRightItem = {
  title: string;
  desc: string;
};

export type HomeTripHighlight = {
  name: string;
  image?: any;
  description: string;
};

export type HomeTrip = {
  title: string;
  slug: string;
  subtitle: string;
  image?: any;
  thumb?: any;
  about?: string;
  highlights?: HomeTripHighlight[];
};

export type HomeExperience = {
  title: string;
  desc: string;
};

export type AboutCard = {
  label?: string;
  icon?: "sparkles" | "gem" | "timer";
  text?: string;
};

export type HomeData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideo?: any;
  heroPoster?: any;

  heroRightEyebrow?: string;
  heroRightTitle?: string;
  heroRightItems?: HeroRightItem[];

  tripsHeading?: string;
  tripsSubtitle?: string;
  trips?: HomeTrip[];

  experiencesHeading?: string;
  experiencesSubtitle?: string;
  experiences?: HomeExperience[];

  aboutHeading?: string;
  aboutBody?: any[];
  aboutWatermarkImage?: any;

  aboutCards?: AboutCard[];
  aboutFootnote?: string;

  contactHeading?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
};

/* =========================
   HOMEPAGE QUERIES
========================= */
export async function getHomeData(): Promise<HomeData | null> {
  const query = `*[
    _type == "homepage" &&
    !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0]{
    heroTitle,
    heroSubtitle,
    heroVideo,
    heroPoster,

    heroRightEyebrow,
    heroRightTitle,
    heroRightItems[]{ title, desc },

    tripsHeading,
    tripsSubtitle,
    trips[]{
      title,
      slug,
      subtitle,
      image,
      thumb,
      about,
      highlights[]{ name, image, description }
    },

    experiencesHeading,
    experiencesSubtitle,
    experiences[]{title, desc},

    aboutHeading,
    aboutBody,
    aboutWatermarkImage,

    aboutCards[]{ label, icon, text },
    aboutFootnote,

    contactHeading,
    contactEmail,
    contactWhatsapp
  }`;

  return sanityClient.fetch(query, {}, { next: { revalidate: 5 } });
}

export async function getTripSlugsFromHome(): Promise<string[]> {
  const query = `*[
    _type == "homepage" && !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0]{
    "slugs": trips[]{
      "slug": coalesce(slug.current, slug)
    }
  }.slugs[].slug`;

  const slugs = await sanityClient.fetch<string[]>(
    query,
    {},
    { next: { revalidate: 5 } }
  );

  return (slugs || [])
    .map((s) => String(s || "").trim().toLowerCase())
    .filter(Boolean);
}

export async function getTripFromHome(slug: string): Promise<HomeTrip | null> {
  const query = `*[
    _type == "homepage" && !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0]{
    "trip": trips[
      lower(coalesce(slug.current, slug)) == $slug
    ][0]{
      title,
      "slug": coalesce(slug.current, slug),
      subtitle,
      image,
      thumb,
      about,
      highlights[]{ name, image, description }
    }
  }.trip`;

  return sanityClient.fetch(
    query,
    { slug: slug.toLowerCase() },
    { next: { revalidate: 5 } }
  );
}

/* =========================
   LEGAL TYPES
========================= */
export type LegalPageData = {
  _id?: string;
  _updatedAt?: string;
  title?: string;
  subtitle?: string;
  content?: any[];
  slug?: string;
};

export async function getLegalPageById(id: string): Promise<LegalPageData | null> {
  const query = `*[
    _type == "legalPage" &&
    !(_id in path("drafts.**")) &&
    _id == $id
  ][0]{
    _id,
    _updatedAt,
    title,
    subtitle,
    content,
    "slug": slug
  }`;

  // ✅ SAME style as Site Settings: no caching
  return sanityServerClient.fetch(query, { id });
}

// =========================
// AI DESTINATION TARGETS
// =========================
export async function getTripTargetsForAI(): Promise<string[]> {
  const query = `*[
    _type == "homepage" &&
    !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0]{
    "targets": trips[]{
      "title": title,
      "slug": coalesce(slug.current, slug)
    }
  }.targets`;

  const rows =
    (await sanityServerClient.fetch<
      { title?: string; slug?: string }[]
    >(query, {}, { next: { revalidate: 0 } })) || [];

  // Prefer titles (Morocco), but slug fallback
  const clean = rows
    .map((r) => (r?.title || r?.slug || "").trim())
    .filter(Boolean);

  // Remove duplicates
  return Array.from(new Set(clean));
}