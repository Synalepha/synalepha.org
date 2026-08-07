import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";
import { ResendConfirmation } from "@/components/ResendConfirmation";
import { PasswordRecovery } from "@/components/PasswordRecovery";
export const metadata = {
  title: "Log in — LoudPage",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <Brand />
      <section>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Turn your page back on.</h1>
        <p className="auth-intro">
          One email address equals one account. If you already confirmed, log in
          or reset that account’s password—do not sign up again.
        </p>
        {error && (
          <p className="form-error callback-error" role="alert">
            {error}
          </p>
        )}
        <AuthForm mode="login" />
        <PasswordRecovery />
        <ResendConfirmation />
        <p className="new-account-link">
          Never made an account? <Link href="/signup">Create a LoudPage</Link>
        </p>
      </section>
    </main>
  );
}
