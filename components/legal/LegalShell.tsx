import Link from "next/link";
import Container from "@/components/ui/Container";

export default function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-(--light) blur-3xl" />
        <div className="absolute -bottom-64 right-[-140px] h-[560px] w-[560px] rounded-full bg-(--light) blur-3xl" />
        <div className="absolute inset-0 opacity-[0.45] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-size-[18px_18px]" />
      </div>

      <Container className="relative py-14">
        <Link href="/" className="text-sm font-semibold text-(--primary) hover:opacity-80">
          ← Back to home
        </Link>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-(--primary) md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-(--muted)">{subtitle}</p>

        <div className="prose prose-slate mt-10 max-w-none">
          {children}
          <p className="text-sm text-(--muted)">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </Container>
    </main>
  );
}
