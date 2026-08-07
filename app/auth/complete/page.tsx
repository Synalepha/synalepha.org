import { Brand } from "@/components/Brand";
import { AuthComplete } from "@/components/AuthComplete";
export default function Complete() {
  return (
    <main className="auth-page">
      <Brand />
      <section>
        <p className="eyebrow">ACCOUNT CONFIRMATION</p>
        <h1>Opening your LoudPage.</h1>
        <AuthComplete />
      </section>
    </main>
  );
}
