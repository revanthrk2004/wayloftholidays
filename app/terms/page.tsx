// app/terms/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPage } from "@/sanity/lib/legal-queries";

export default async function TermsPage() {
  noStore();
  const cms = await getLegalPage("terms");

  return (
    <LegalShell
      title={cms?.title || "Terms of Service"}
      subtitle={
        cms?.subtitle ||
        "These terms explain how the WayLoft Holidays website and trip planning service works."
      }
    >
      {cms?.content?.length ? <PortableText value={cms.content} /> : <p>No CMS content found.</p>}
    </LegalShell>
  );
}