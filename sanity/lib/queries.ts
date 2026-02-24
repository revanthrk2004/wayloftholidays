import { sanityClient } from "./client";

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

/* =========================
   LEGAL QUERIES
========================= */
export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  const query = `*[
    _type == "legalPage" &&
    !(_id in path("drafts.**")) &&
    lower(slug) == $slug
  ] | order(_updatedAt desc)[0]{
    _id,
    _updatedAt,
    title,
    subtitle,
    content,
    "slug": slug
  }`;

  return sanityClient.fetch(query, { slug: slug.toLowerCase() });
}

export async function getLegalSlugs(): Promise<string[]> {
  const query = `*[
    _type == "legalPage" &&
    !(_id in path("drafts.**"))
  ].slug`;

  const slugs = await sanityClient.fetch<string[]>(query);

  return (slugs || [])
    .map((s) => String(s || "").trim().toLowerCase())
    .filter(Boolean);
}
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

  return sanityClient.fetch(query, { id });
}