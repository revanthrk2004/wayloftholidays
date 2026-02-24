import { sanityClient } from "./client";

export type LegalPageData = {
  _id?: string;
  _updatedAt?: string;
  title?: string;
  subtitle?: string;
  content?: any[];
  slug?: string;
};

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