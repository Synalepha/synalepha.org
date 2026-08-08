import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";
import { DraftArrival } from "@/components/DraftArrival";
export const metadata = {
  title: "Create your LoudPage",
  description:
    "Create an expressive personal page with intentional friendships and hard privacy boundaries.",
  alternates: { canonical: "/signup" },
  openGraph: { url: "/signup" },
};
export default function Signup() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  return (
    <main className="auth-page">
      <Brand />
      <section>
        <p className="eyebrow">SAVE YOUR PAGE</p>
        <h1>Make it yours.</h1>
        <DraftArrival />
        <p className="auth-intro">
          Start with a private account. You choose when your page is ready and
          who gets to see it.
        </p>
        <div className="signup-steps" aria-label="Account setup progress">
          <b>1 · Save</b>
          <span>2 · Choose your people</span>
          <span>3 · Share when ready</span>
        </div>
        <AuthForm
          mode="signup"
          maxBirthDate={cutoff.toISOString().slice(0, 10)}
        />
        <p>
          Already created or confirmed this email?{" "}
          <Link href="/login">Use the existing account</Link>
        </p>
      </section>
    </main>
  );
}
