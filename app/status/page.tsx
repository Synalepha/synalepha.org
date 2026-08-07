import Link from "next/link";
import { Brand } from "@/components/Brand";
export const metadata = {
  title: "Product Status — LoudPage",
  description:
    "What works, what is limited, and what is not launched in the LoudPage beta.",
  alternates: { canonical: "/status" },
  openGraph: { url: "/status" },
};
const systems = [
  [
    "Accounts",
    "Operational",
    "Email creation, confirmation, recovery, and persistent sessions",
  ],
  [
    "Page privacy",
    "Operational",
    "Age-aware defaults and database-enforced visibility",
  ],
  ["Friendships", "Operational", "Mutual requests with adult/minor separation"],
  [
    "Messages",
    "Limited beta",
    "Accepted-friend requirement is enforced; interface remains intentionally narrow",
  ],
  [
    "Media uploads",
    "Not launched",
    "Hidden until scanning and moderation pipeline is production-ready",
  ],
  [
    "Reports",
    "Operational",
    "Private submission and member-visible lifecycle status",
  ],
  [
    "Page composer",
    "Beta",
    "Draft recovery, curated layouts, themes, signal, and exact saved preview",
  ],
];
export default function Status() {
  return (
    <>
      <header className="topbar">
        <Brand />
        <nav>
          <Link href="/trust">Trust Console</Link>
          <Link href="/safety">Safety</Link>
          <Link className="nav-cta" href="/signup">
            Make your page
          </Link>
        </nav>
      </header>
      <main className="status-page">
        <p className="eyebrow">PRODUCT TRUTH · NO THEATER</p>
        <h1>
          What works.
          <br />
          What doesn’t yet.
        </h1>
        <p className="lede">
          A launch boundary for LoudPage’s private beta. “Not launched” means
          there is no decorative dead button pretending otherwise.
        </p>
        <div className="status-list">
          {systems.map(([name, state, detail]) => (
            <article key={name}>
              <div>
                <h2>{name}</h2>
                <span
                  className={`system-state state-${state.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {state}
                </span>
              </div>
              <p>{detail}</p>
            </article>
          ))}
        </div>
        <p className="policy-freshness">
          Reviewed August 7, 2026 ·{" "}
          <Link href="/trust">test safety boundaries</Link>
        </p>
      </main>
    </>
  );
}
