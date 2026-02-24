import { sanityClient } from "./client";

export type LegalPageData = {
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
  ][0]{
    title,
    subtitle,
    content,
    "slug": slug
  }`;

  return sanityClient.fetch(
    query,
    { slug: slug.toLowerCase() },
    { next: { revalidate: 5 } }
  );
}

// ✅ optional but recommended (for static generation)
export async function getLegalSlugs(): Promise<string[]> {
  const query = `*[
    _type == "legalPage" &&
    !(_id in path("drafts.**"))
  ].slug`;

  const slugs = await sanityClient.fetch<string[]>(
    query,
    {},
    { next: { revalidate: 5 } }
  );

  return (slugs || [])
    .map((s) => String(s || "").trim().toLowerCase())
    .filter(Boolean);
}