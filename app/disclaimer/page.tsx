import LegalShell from "@/components/legal/LegalShell";

export default function DisclaimerPage() {
  return (
    <LegalShell
      title="Disclaimer"
      subtitle="Important info about the content and recommendations on this website."
    >
      <h2>Information only</h2>
      <p>
        Content on this site is for general information and trip inspiration. It is not financial, legal, or medical advice.
      </p>

      <h2>Availability and pricing</h2>
      <p>
        Travel availability and prices can change quickly. Any suggestions are subject to change until confirmed.
      </p>

      <h2>Third party services</h2>
      <p>
        We may recommend airlines, hotels, and experiences, but we do not control third party services. Where possible, we will support you if issues arise.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <strong>support@wayloftholidays.com</strong>
      </p>
    </LegalShell>
  );
}
