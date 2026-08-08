import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postBulletin } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: bulletins }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username,display_name,avatar_url,mood,bio")
      .eq("id", user.id)
      .single(),
    supabase
      .from("bulletins")
      .select(
        "id,body,created_at,profiles!bulletins_author_id_fkey(display_name,username,avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  const shell = profile || {
    username: null,
    display_name: null,
    avatar_url: null,
  };
  return (
    <AppShell profile={shell}>
      <div className="dashboard">
        <aside className="page-peek">
          <div className="avatar hero-avatar">
            {(profile?.display_name ||
              profile?.username ||
              "Y")[0].toUpperCase()}
          </div>
          <p className="eyebrow">YOUR PAGE</p>
          <h2>{profile?.display_name || "Your Roomtone"}</h2>
          <p className="mood-line">
            {profile?.mood
              ? `mood: ${profile.mood}`
              : "Set a mood and make this yours."}
          </p>
          <p>
            {profile?.bio ||
              "Your About Me is waiting for a little personality."}
          </p>
          <div className="stacked-actions">
            <Link className="primary" href="/settings">
              Edit my page
            </Link>
            <Link href="/profile">View public page</Link>
          </div>
        </aside>
        <section className="feed">
          <section className="weekly-return">
            <div>
              <p className="eyebrow">WHAT CHANGED WITH YOUR PEOPLE</p>
              <h2>The people you would actually miss.</h2>
            </div>
            <div>
              <b>{bulletins?.length || 0}</b>
              <span>changes from your people</span>
            </div>
            <div>
              <b>0</b>
              <span>popularity scores</span>
            </div>
            <Link href="/friends">Choose who belongs →</Link>
          </section>
          <div className="section-title">
            <div>
              <p className="eyebrow">LIFE, IN THE ORDER IT HAPPENED</p>
              <h1>From your people</h1>
            </div>
            <span className="chronological">
              ↓ chronological · no suggested posts
            </span>
          </div>
          <form action={postBulletin} className="composer">
            <label htmlFor="bulletin">What changed for you?</label>
            <textarea
              id="bulletin"
              name="body"
              maxLength={2000}
              placeholder="A small note for the people you chose…"
              required
            />
            <div>
              <small>Shared with your people · 2,000 characters</small>
              <button className="primary">Post</button>
            </div>
          </form>
          {bulletins?.length ? (
            bulletins.map((b: any) => (
              <article className="bulletin" key={b.id}>
                <div className="avatar">
                  {b.profiles?.display_name?.[0] ||
                    b.profiles?.username?.[0] ||
                    "?"}
                </div>
                <div>
                  <Link href={`/u/${b.profiles?.username || ""}`}>
                    <b>
                      {b.profiles?.display_name ||
                        b.profiles?.username ||
                        "Member"}
                    </b>
                  </Link>
                  <time>{new Date(b.created_at).toLocaleString()}</time>
                  <p>{b.body}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">
              <span>✦</span>
              <b>You are caught up.</b>
              <p>Nothing new from your people. This is a good place to stop.</p>
              <Link href="/settings">Change something on my page</Link>
            </div>
          )}
        </section>
        <aside className="right-rail">
          <div className="rail-card">
            <p className="eyebrow">START HERE</p>
            <ol>
              <li className={profile?.bio ? "done" : ""}>
                Write your About Me
              </li>
              <li>Find people you know</li>
              <li>Choose your people</li>
              <li>Post something honest</li>
            </ol>
          </div>
          <div className="rail-card glow-card">
            <b>You can finish.</b>
            <p>When you have seen what changed, the feed ends.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
