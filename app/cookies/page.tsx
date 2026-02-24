// app/cookies/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPage } from "@/sanity/lib/legal-queries";

export default async function CookiesPage() {
  noStore();
  const cms = await getLegalPage("cookies");

  return (
    <LegalShell
      title={cms?.title || "Cookies Policy"}
      subtitle={
        cms?.subtitle ||
        "We use cookies to improve your experience and understand site usage."
      }
    >
      {cms?.content?.length ? <PortableText value={cms.content} /> : <p>No CMS content found.</p>}
    </LegalShell>
  );
}