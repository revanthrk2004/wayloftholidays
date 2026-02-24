// app/disclaimer/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPage } from "@/sanity/lib/legal-queries";

export default async function DisclaimerPage() {
  noStore();
  const cms = await getLegalPage("disclaimer");

  return (
    <LegalShell
      title={cms?.title || "Disclaimer"}
      subtitle={
        cms?.subtitle ||
        "Important info about the content and recommendations on this website."
      }
    >
      {cms?.content?.length ? <PortableText value={cms.content} /> : <p>No CMS content found.</p>}
    </LegalShell>
  );
}