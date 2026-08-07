import Link from "next/link";
import { Brand } from "@/components/Brand";
export const metadata = {
  title: "Community Rules — LoudPage",
  description: "The consent, privacy, safety, and conduct rules for LoudPage.",
  alternates: { canonical: "/community" },
  openGraph: { url: "/community" },
};
export default function Community() {
  return (
    <main className="policy-page">
      <Brand />
      <p className="eyebrow">COMMUNITY RULES</p>
      <h1>Be expressive. Don’t be cruel.</h1>
      <ol>
        <li>Respect consent, privacy, identity, and boundaries.</li>
        <li>
          No harassment, hate, threats, stalking, doxxing, or targeted
          humiliation.
        </li>
        <li>
          No sexual exploitation, grooming, or sexual content involving minors.
          Ever.
        </li>
        <li>
          No spam, scams, malware, manipulated impersonation, or coordinated
          abuse.
        </li>
        <li>
          Do not publish someone else’s private information or intimate media.
        </li>
        <li>Use reports and blocks instead of escalating conflict.</li>
      </ol>
      <h2>How enforcement works</h2>
      <p>
        Reports enter a moderator queue. Uploaded media remains pending until
        approved. Moderators can review, resolve, dismiss, or reject material.
        Serious or repeated violations can result in suspension.
      </p>
      <p>
        <Link href="/safety">Open the Safety Center</Link> for plain-language
        controls and guidance.
      </p>
    </main>
  );
}
