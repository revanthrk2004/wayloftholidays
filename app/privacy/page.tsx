import LegalShell from "@/components/legal/LegalShell";
import { PortableText } from "@portabletext/react";
import { getLegalPage } from "@/sanity/lib/legal-queries";

export default async function PrivacyPage() {
  const cms = await getLegalPage("privacy");

  return (
    <LegalShell
      title={cms?.title || "Privacy Policy"}
      subtitle={
        cms?.subtitle || "How we handle your information when you use WayLoft Holidays."
      }
    >
      {cms?.content?.length ? (
        <PortableText value={cms.content} />
      ) : (
        <>
          <h2>What we collect</h2>
          <p>
            When you plan a trip, you may share details like your name, email,
            WhatsApp number, destination, dates, budget, and preferences.
          </p>

          <h2>How we use it</h2>
          <p>
            We use your info to contact you, understand your request, and craft
            itinerary suggestions. We do not sell your personal data.
          </p>

          <h2>Third parties</h2>
          <p>
            If you choose to proceed with bookings, we may share necessary details
            with airlines, hotels, or partners only to complete that booking.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep trip planning requests only as long as needed for support,
            follow ups, and service improvements.
          </p>

          <h2>Contact</h2>
          <p>
            Privacy questions: <strong>privacy@WayLoftholidays.com</strong>
          </p>
        </>
      )}
    </LegalShell>
  );
}