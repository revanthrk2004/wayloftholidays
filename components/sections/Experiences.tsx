import Container from "@/components/ui/Container";

export default function Experiences() {
  return (
    <section id="experiences" className="py-20 bg-white">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">Experiences</h2>
          <p className="mt-3 text-(--muted)">
            Aesthetic cafés, iconic spots, hidden gems, and experiences that feel personal.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            "Private dining with a view",
            "Curated neighbourhood walks",
            "Local guide experiences",
            "Photo-first day plans",
          ].map((t) => (
            <div key={t} className="rounded-3xl bg-(--light) p-5 ring-1 ring-black/5">
              <div className="text-sm font-semibold text-(--primary)">{t}</div>
              <div className="mt-2 text-sm text-(--muted)">
                Built around your pace, your vibe, and your budget.
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
