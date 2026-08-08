import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";
import { signOutEverywhere } from "@/app/actions";
export default async function Account() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase
    .from("profiles")
    .select("username,display_name,avatar_url,visibility")
    .eq("id", user.id)
    .single();
  return (
    <AppShell
      profile={p || { username: null, display_name: null, avatar_url: null }}
    >
      <div className="settings-page">
        <p className="eyebrow">ACCOUNT &amp; SAFETY</p>
        <h1>You control the exits.</h1>
        <p className="lede">
          Stay signed in on devices you trust. On a shared device, log out when
          you finish.
        </p>
        <section className="account-card">
          <h2>Reports &amp; moderation</h2>
          <p>
            Every report has a visible status: Open, Reviewing, Resolved, or
            Dismissed. Report details remain private.
          </p>
          <Link href="/account/reports">Track my reports</Link>
        </section>
        <section className="account-card">
          <h2>Your data</h2>
          <p>
            Download a portable JSON copy of your profile, bulletins, comments,
            friendships, and messages.
          </p>
          <Link className="primary" href="/account/export">
            Download my data
          </Link>
        </section>
        <section className="account-card">
          <h2>Device safety</h2>
          <p>
            Think an old phone, shared computer, or forgotten browser is still
            signed in? End every Roomtone session at once.
          </p>
          <form action={signOutEverywhere}>
            <button className="secondary-button">
              Sign out on every device
            </button>
          </form>
        </section>
        <section className="account-card">
          <h2>Privacy snapshot</h2>
          <p>
            Your page is currently{" "}
            <b>
              {p?.visibility === "public"
                ? "visible to everyone"
                : p?.visibility === "friends"
                  ? "visible to friends only"
                  : "visible only to you"}
            </b>
            .
          </p>
          <Link href="/settings">Change page visibility</Link> ·{" "}
          <Link href="/privacy">Read the privacy promise</Link>
        </section>
        <section className="account-card danger-card">
          <h2>Delete account</h2>
          <p>
            This permanently deletes your account and cascades through its
            profile and owned content. Download your data first. This cannot be
            undone.
          </p>
          <DeleteAccountForm />
        </section>
      </div>
    </AppShell>
  );
}
