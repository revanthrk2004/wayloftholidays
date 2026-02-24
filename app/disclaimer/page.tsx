export const revalidate = 5;
import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPage } from "@/sanity/lib/legal-queries";

export default async function DisclaimerPage() {
  const cms = await getLegalPage("disclaimer");

  return (
    <LegalShell
      title={cms?.title || "Disclaimer"}
      subtitle={
        cms?.subtitle ||
        "Important info about the content and recommendations on this website."
      }
    >
      {cms?.content?.length ? (
        <PortableText value={cms.content} />
      ) : (
        <>
          <h2>Information only</h2>
          <p>
            Content on this site is for general information and trip inspiration.
            It is not financial, legal, or medical advice.
          </p>

          <h2>Availability and pricing</h2>
          <p>
            Travel availability and prices can change quickly. Any suggestions are
            subject to change until confirmed.
          </p>

          <h2>Third party services</h2>
          <p>
            We may recommend airlines, hotels, and experiences, but we do not
            control third party services. Where possible, we will support you if
            issues arise.
          </p>

          <h2>Contact</h2>
          <p>
            Questions: <strong>support@WayLoftholidays.com</strong>
          </p>
        </>
      )}
    </LegalShell>
  );
}