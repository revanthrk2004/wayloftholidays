import { sanityClient } from "./client";

export type HomeTrip = {
  title: string;
  slug: string; // <-- still a string in your app (we read slug.current)
  subtitle: string;
  image?: any;
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
  const query = `*[_type=="homepage"][0]{
    heroTitle,
    heroSubtitle,
    heroVideo,
    heroPoster,

    tripsHeading,
    tripsSubtitle,
    trips[]{
      title,
      "slug": slug.current,
      subtitle,
      image
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
