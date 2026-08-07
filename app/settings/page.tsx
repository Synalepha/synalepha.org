import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase
    .from("profiles")
    .select(
      "username,display_name,avatar_url,bio,mood,city,profile_song_title,profile_song_url,visibility,theme,birth_date,comment_permission,allow_tags,discoverable,search_indexing",
    )
    .eq("id", user.id)
    .single();
  if (!p) return null;
  const isMinor = Boolean(
    p.birth_date &&
      new Date(p.birth_date) >
        new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
  );
  const completed = [Boolean(p.display_name), Boolean(p.bio), Boolean(p.mood), Boolean(p.theme), p.visibility !== null].filter(Boolean).length;
  return (
    <AppShell profile={p}>
      <div className="settings-page">
        <p className="eyebrow">YOUR BACKSTAGE · CREATION PATH {completed}/5</p>
        <h1>Shape your page</h1>
        <p className="lede">
          Choose a template, tune its voice, set hard boundaries, and preview
          exactly what other people will see.
        </p>
        <ol className="onboarding-path" aria-label="Page creation progress"><li className="done">Claim identity</li><li className={p.bio ? "done" : ""}>Tell your story</li><li className={p.mood ? "done" : ""}>Set Page Signal</li><li className={p.theme ? "done" : ""}>Compose the page</li><li>Preview &amp; publish</li></ol>
        <ProfileForm profile={p} isMinor={isMinor} />
      </div>
    </AppShell>
  );
}
