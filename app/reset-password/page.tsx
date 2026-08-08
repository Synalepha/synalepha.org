import { Brand } from "@/components/Brand";
import { PasswordUpdateForm } from "@/components/PasswordUpdateForm";
export const metadata = {
  title: "Reset password — Roomtone",
  robots: { index: false, follow: false },
};
export default function ResetPassword() {
  return (
    <main className="auth-page">
      <Brand />
      <section>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">
          This changes the password on your existing Roomtone account. It does
          not create another account.
        </p>
        <PasswordUpdateForm />
      </section>
    </main>
  );
}
