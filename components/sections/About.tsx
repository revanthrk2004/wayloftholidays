import Container from "@/components/ui/Container";

export default function About() {
  return (
    <section id="about" className="py-20">
      <Container>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight text-(--primary)">About Wayloft</h2>
          <p className="mt-3 text-(--muted)">
            Wayloft is built for people who want premium trips without the stress. We plan like a friend with taste and a spreadsheet.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { k: "Personal", v: "Designed around you" },
              { k: "Premium", v: "Stays, routes, details" },
              { k: "Fast", v: "45 seconds to request" },
            ].map((x) => (
              <div key={x.k} className="rounded-3xl bg-white p-5 ring-1 ring-black/10">
                <div className="text-xs font-semibold text-(--muted)">{x.k}</div>
                <div className="mt-1 text-sm font-semibold text-(--primary)">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
