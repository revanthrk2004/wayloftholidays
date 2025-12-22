import Container from "@/components/ui/Container";
import Link from "next/link";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">Contact</h2>
          <p className="mt-3 text-(--muted)">
            The fastest way is the AI concierge (bottom right). Or go straight to the plan form.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="rounded-2xl bg-(--primary) px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Plan my trip
            </Link>

            <a
              href="mailto:hello@wayloftholidays.com"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-(--primary) ring-1 ring-black/10 hover:bg-black/2"
            >
              Email us
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}