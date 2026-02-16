import { sanityClient } from "./client";

export type HomeTripHighlight = {
  name: string;
  image?: any;
  description: string;
};

export type HomeTrip = {
  title: string;
  slug: string; // <-- still a string in your app (we read slug.current)
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

export type HomeData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideo?: any;
  heroPoster?: any;

  tripsHeading?: string;
  tripsSubtitle?: string;
  trips?: HomeTrip[];

  experiencesHeading?: string;
  experiencesSubtitle?: string;
  experiences?: HomeExperience[];

  aboutHeading?: string;
  aboutBody?: any[];

  contactHeading?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
};

export async function getHomeData(): Promise<HomeData | null> {
  const query = `*[
  _type == "homepage" &&
  !(_id in path("drafts.**"))
] | order(_updatedAt desc)[0]{
    heroTitle,
    heroSubtitle,
    heroVideo,
    heroPoster,

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

    contactHeading,
    contactEmail,
    contactWhatsapp
  }`;

  return sanityClient.fetch(query, {}, { next: { revalidate: 5 } });
}
export async function getTripFromHome(slug: string): Promise<HomeTrip | null> {
  const query = `*[_type=="homepage"][0]{
    "trip": trips[slug == $slug][0]{
      title,
      slug,
      subtitle,
      image,
      thumb,
      about,
      highlights[]{ name, image, description }
    }
  }.trip`;

  return sanityClient.fetch(query, { slug });
}

export async function getTripSlugsFromHome(): Promise<string[]> {
  const query = `*[
    _type == "homepage" &&
    !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0]{
    "slugs": trips[].slug
  }.slugs`;

  const slugs = await sanityClient.fetch<string[] | null>(
    query,
    {},
    { next: { revalidate: 60 } }
  );

  return (slugs ?? []).filter(Boolean).map((s) => String(s).trim().toLowerCase());
}
