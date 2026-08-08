import { Brand } from "@/components/Brand";
export const metadata = {
  title: "Beta Terms — Roomtone",
  description: "Terms for using the Roomtone beta safely and lawfully.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
};
export default function Terms() {
  return (
    <main className="policy-page">
      <Brand />
      <p className="eyebrow">BETA TERMS</p>
      <h1>Use the space without harming the people in it.</h1>
      <p>
        Roomtone is an early beta for people aged 13 and older. Do not use it
        for harassment, exploitation, impersonation, illegal activity, spam, or
        sharing content you do not have the right to publish.
      </p>
      <p>
        Features may change while safety, moderation, and account-management
        controls are completed.
      </p>
    </main>
  );
}
