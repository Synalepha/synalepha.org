import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";
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
        <p className="eyebrow">ONE PERSON · ONE ACCOUNT</p>
        <h1>Make your corner of the internet loud.</h1>
        <p className="auth-intro">
          Create one private home for your page and activity. Existing accounts
          are preserved, never replaced. Under-18 pages begin Only me, cannot
          become public, and are separated from adult discovery and friendship
          requests.
        </p>
        <div className="signup-steps" aria-label="Account setup progress">
          <b>1 · Account</b>
          <span>2 · Shape your page</span>
          <span>3 · Preview &amp; publish</span>
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
