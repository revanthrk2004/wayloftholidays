import Container from "@/components/ui/Container";

export default function Trips() {
  return (
    <section id="trips" className="py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">Trips</h2>
          <p className="mt-3 text-(--muted)">
            Curated routes, premium stays, and the kind of details people forget until it ruins the trip. We don’t miss them.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "Luxury Escapes", desc: "5-star stays, transfers, dining moments." },
            { title: "Romantic Getaways", desc: "Views, pace, surprises, and privacy." },
            { title: "City + Culture", desc: "Museums, cafés, hidden streets, local flavour." },
          ].map((x) => (
            <div key={x.title} className="rounded-3xl bg-white p-5 ring-1 ring-black/10 shadow-[0_18px_50px_rgba(11,60,111,0.08)]">
              <div className="text-sm font-semibold text-(--primary)">{x.title}</div>
              <div className="mt-2 text-sm text-(--muted)">{x.desc}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
