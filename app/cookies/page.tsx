export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPageById, listLegalPages } from "@/sanity/lib/queries";

export default async function CookiesPage() {
  noStore();

  const cms = await getLegalPageById("legal.cookies");
  const list = await listLegalPages();

  return (
    <LegalShell
      title={cms?.title || "Cookies Policy"}
      subtitle={cms?.subtitle || "We use cookies to improve your experience and understand site usage."}
    >
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        ENV: project={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID} dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
      </p>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        CMS: id={cms?._id || "(null)"} updated={cms?._updatedAt || "(null)"}
      </p>

      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer" }}>Debug: legal pages in production</summary>
        <pre style={{ fontSize: 12, opacity: 0.85 }}>
          {JSON.stringify(list, null, 2)}
        </pre>
      </details>

      {cms?.content?.length ? <PortableText value={cms.content} /> : <p>No CMS content found.</p>}
    </LegalShell>
  );
}