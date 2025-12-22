import LegalShell from "@/components/legal/LegalShell";

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="These terms explain how the Wayloft Holidays website and trip planning service works."
    >
      <h2>Using the site</h2>
      <p>
        You agree not to misuse the website, attempt to disrupt it, or submit false information.
      </p>

      <h2>Trip planning</h2>
      <p>
        Any itineraries or suggestions shared are based on the info you provide and availability at the time. Prices can change.
      </p>

      <h2>Bookings</h2>
      <p>
        If we place a booking through partners, their terms may also apply. We will always clarify before confirming anything.
      </p>

      <h2>Liability</h2>
      <p>
        We are not responsible for delays, cancellations, or issues caused by third parties (airlines, hotels, etc.). We will help you where we can.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <strong>support@wayloftholidays.com</strong>
      </p>
    </LegalShell>
  );
}
