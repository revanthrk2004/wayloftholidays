import LegalShell from "@/components/legal/LegalShell";

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookies Policy"
      subtitle="We use cookies to improve your experience and understand site usage."
    >
      <h2>What are cookies?</h2>
      <p>
        Cookies are small files stored on your device. They help websites remember preferences and measure performance.
      </p>

      <h2>How we use cookies</h2>
      <p>
        We may use essential cookies for basic site functionality and analytics cookies to understand how visitors use the site.
      </p>

      <h2>Your choices</h2>
      <p>
        You can accept or reject non essential cookies using the cookie banner. You can also clear cookies anytime in your browser settings.
      </p>

      <h2>Contact</h2>
      <p>
        Cookies questions: <strong>support@wayloftholidays.com</strong>
      </p>
    </LegalShell>
  );
}
