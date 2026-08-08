import Link from "next/link";
import { Brand } from "@/components/Brand";
export const metadata = {
  title: "Product Status — Roomtone",
  description:
    "What works, what is limited, and what is not launched in the Roomtone beta.",
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
    "Right Now",
    "Beta",
    "Inline feeling, note, song, audience, draft persistence, and share-ready presentation",
  ],
  [
    "My People circles",
    "Foundation",
    "Database model and accepted-friend boundaries are ready; circle management is not yet exposed",
  ],
  [
    "Messages",
    "Limited beta",
    "Accepted-friend requirement is enforced; interface remains intentionally narrow",
  ],
  [
    "Media uploads",
    "Not launched",
    "Quarantine, processing, metadata-stripping, alt-text, and approval guards are defined; upload delivery and scanning workers are not launched",
  ],
  [
    "Reports",
    "Operational",
    "Private submission and member-visible lifecycle status",
  ],
  [
    "Page composer",
    "Beta",
    "Direct editing, photo-strip preview, notes, stickers, doodles, mixtapes, per-object audience, reorder, Calm, Reading Comfort, Low Data, and local recovery",
  ],
  [
    "Spanish",
    "Limited beta",
    "The pre-signup object creator can switch between English and Spanish; account, safety, and recovery localization remains in progress",
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
          A launch boundary for Roomtone’s private beta. “Not launched” means
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
