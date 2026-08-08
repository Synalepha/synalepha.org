import Link from "next/link";
import { Brand } from "@/components/Brand";
export const metadata = {
  title: "Safety Center — Roomtone",
  description:
    "Plain-language safety defaults, boundaries, reporting, blocking, and protections for younger members.",
  alternates: { canonical: "/safety" },
  openGraph: { url: "/safety" },
};
export default function Safety() {
  return (
    <main className="policy-page">
      <Brand />
      <p className="eyebrow">ROOMTONE SAFETY CENTER</p>
      <h1>Good boundaries make better pages.</h1>
      <div className="safety-glance" aria-label="Safety at a glance">
        <article><b>Under 18</b><span>Starts Only me</span></article>
        <article><b>Messages</b><span>Mutual people only</span></article>
        <article><b>Block</b><span>Private and immediate</span></article>
        <article><b>Reports</b><span>Status stays visible</span></article>
      </div>
      <details open>
        <summary>Under-18 protection</summary>
        <p>Under-18 pages cannot be public. Anonymous visitors cannot see them. Adult and minor discovery stays separate.</p>
      </details>
      <details>
        <summary>What younger members should know</summary>
        <ul>
          <li>Use a nickname if it feels safer.</li>
          <li>Never post your school, routine, address, live location, or phone number.</li>
          <li>Tell a trusted adult when behavior feels sexual, threatening, coercive, or persistent.</li>
        </ul>
      </details>
      <details>
        <summary>Messages, guestbooks, tags, and search</summary>
        <p>Messages require a mutual connection. Guestbooks can allow people, friends, or nobody. Search indexing is separate and disabled for minors.</p>
      </details>
      <details>
        <summary>Blocking and reporting</summary>
        <p>Blocking is private. Reports are private. Report status remains visible as Open, Reviewing, Resolved, or Dismissed.</p>
      </details>
      <details>
        <summary>For families</summary>
        <p>Review audience choices together. Do not share passwords. Use global sign-out for lost or shared devices. Birth dates are never public.</p>
      </details>
      <h2>Your control panel</h2>
      <p>
        <Link href="/account">Account &amp; Safety</Link> handles report
        tracking, export, global sign-out, privacy status, and permanent
        deletion. <Link href="/privacy">Read the privacy promise</Link>.
      </p>
    </main>
  );
}
