export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPageById } from "@/sanity/lib/queries";

export default async function PrivacyPage() {
  noStore();
  const cms = await getLegalPageById("legal.privacy");

  return (
    <LegalShell
      title={cms?.title || "Privacy Policy"}
      subtitle={cms?.subtitle || "How we handle your information when you use WayLoft Holidays."}
    >
      {cms?.content?.length ? <PortableText value={cms.content} /> : <p>No CMS content found.</p>}
    </LegalShell>
  );
}