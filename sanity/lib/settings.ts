import { sanityClient } from "./client";

export type SiteSettings = {
  brandName?: string;
  brandTagline?: string;
  logo?: any;
  planButtonText?: string;
  footerText?: string;
  hashtag?: string;
  email?: string;
  whatsappLink?: string;
  instagramLink?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const query = `*[_type=="siteSettings"][0]{
    brandName,
    brandTagline,
    logo,
    planButtonText,
    footerText,
    hashtag,
    email,
    whatsappLink,
    instagramLink
  }`;

  return sanityClient.fetch(query);
}
