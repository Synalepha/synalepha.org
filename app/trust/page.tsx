import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TrustConsole } from "@/components/TrustConsole";
export const metadata = {
  title: "Trust Console — Roomtone",
  description:
    "Test Roomtone privacy, age, contact, blocking, and indexing boundaries.",
  alternates: { canonical: "/trust" },
  openGraph: { url: "/trust" },
};
export default function TrustPage() {
  return (
    <>
      <header className="topbar">
        <Brand />
        <nav>
          <Link href="/">Product</Link>
          <Link href="/safety">Safety Center</Link>
          <Link className="nav-cta" href="/signup">
            Make your page
          </Link>
        </nav>
      </header>
      <main className="trust-page">
        <p className="eyebrow">THE ROOMTONE TRUST CONSOLE</p>
        <h1>
          Don’t take our word for it.
          <br />
          Test the boundary.
        </h1>
        <p className="lede">
          A plain-language view of current product rules. This console
          demonstrates the enforced audience model; it does not pretend to be a
          third-party certification.
        </p>
        <TrustConsole />
        <section className="evidence-grid">
          <article>
            <b>DEFAULT</b>
            <h2>Under-18 begins Only me</h2>
            <p>
              The database creates minor profiles private and refuses public
              visibility.
            </p>
          </article>
          <article>
            <b>CONTACT</b>
            <h2>Friendship before messaging</h2>
            <p>
              Conversation creation requires an accepted friendship; adult/minor
              requests remain separated.
            </p>
          </article>
          <article>
            <b>CONTROL</b>
            <h2>Indexing is independent</h2>
            <p>
              Adult public pages still require explicit search-index opt-in.
              Minor indexing stays off.
            </p>
          </article>
          <article>
            <b>RECOURSE</b>
            <h2>Reports have status</h2>
            <p>
              Members can follow a report from Open through Reviewing to
              Resolved or Dismissed.
            </p>
          </article>
        </section>
        <p className="policy-freshness">
          Product enforcement model · updated August 7, 2026 ·{" "}
          <Link href="/privacy">privacy promise</Link> ·{" "}
          <Link href="/community">community rules</Link>
        </p>
      </main>
    </>
  );
}
