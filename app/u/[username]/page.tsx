import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/Brand";
import { DemoProfile } from "@/components/DemoProfile";
import { ShareSignal } from "@/components/ShareSignal";
import {
  blockMember,
  postProfileComment,
  reportMember,
  requestFriend,
} from "@/app/actions";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  if (username === "maya")
    return {
      title: "Maya — staged LoudPage profile",
      description: "Explore a working staged LoudPage profile.",
      robots: { index: true, follow: true },
    };
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("display_name,username,bio,search_indexing,visibility")
    .eq("username", username)
    .maybeSingle();
  const index = Boolean(p?.search_indexing && p.visibility === "public");
  return {
    title: p
      ? `${p.display_name || p.username} — LoudPage`
      : "LoudPage profile",
    description:
      p?.bio?.slice(0, 160) || "An expressive personal page on LoudPage.",
    robots: { index, follow: index },
  };
}
export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (username === "maya") return <DemoProfile />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: p } = await supabase
    .from("profiles")
    .select(
      "id,username,display_name,bio,city,mood,profile_song_title,profile_song_url,created_at,visibility,theme,comment_permission,search_indexing",
    )
    .eq("username", username)
    .single();
  if (!p) notFound();
  const [{ data: circle }, { data: comments }, { data: friendship }] =
    await Promise.all([
      supabase
        .from("top_friends")
        .select(
          "position,profiles!top_friends_friend_id_fkey(username,display_name,avatar_url)",
        )
        .eq("owner_id", p.id)
        .order("position"),
      supabase
        .from("profile_comments")
        .select(
          "id,body,created_at,profiles!profile_comments_author_id_fkey(username,display_name,avatar_url)",
        )
        .eq("profile_id", p.id)
        .order("created_at", { ascending: false })
        .limit(20),
      user
        ? supabase
            .from("friendships")
            .select("status")
            .or(
              `and(requester_id.eq.${user.id},addressee_id.eq.${p.id}),and(requester_id.eq.${p.id},addressee_id.eq.${user.id})`,
            )
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const isOwner = user?.id === p.id,
    isFriend = friendship?.status === "accepted",
    canComment = Boolean(
      user &&
        (isOwner ||
          p.comment_permission === "everyone" ||
          (p.comment_permission === "friends" && isFriend)),
    );
  const theme = p.theme || {},
    hideCircle = Boolean(theme.hide_inner_circle),
    circleLabel = theme.inner_circle_label || "Inner Circle";
  return (
    <div
      className={`public-profile theme-${theme.preset || "classic"} font-${theme.font || "clean"} density-${theme.density || "comfortable"} accent-${theme.accent || "violet"}`}
    >
      <header className="topbar profile-topbar">
        <Brand />
        <nav>
          <Link href="/home">Neighborhood</Link>
          <Link href="/discover">Discover</Link>
          {isOwner ? (
            <Link className="nav-cta" href="/settings">
              Edit my page
            </Link>
          ) : user ? (
            <Link className="nav-cta" href="/profile">
              My page
            </Link>
          ) : (
            <Link className="nav-cta" href="/signup">
              Make your page
            </Link>
          )}
        </nav>
      </header>
      {isOwner && (
        <div className="owner-preview-banner">
          <b>PUBLIC PREVIEW</b>
          <span>
            Audience:{" "}
            {p.visibility === "public"
              ? "Everyone"
              : p.visibility === "friends"
                ? "Friends only"
                : "Only you"}{" "}
            · Search engines: {p.search_indexing ? "allowed" : "blocked"} ·
            Guestbook: {p.comment_permission}
          </span>
          <Link href="/settings">Switch to edit mode</Link>
        </div>
      )}
      <main className="public-page">
        <section className="profile-hero">
          <div className="profile-avatar">
            {(p.display_name || p.username)[0].toUpperCase()}
          </div>
          <div>
            <p className="eyebrow">LOUDPAGE / {p.username}</p>
            <h1>{p.display_name || p.username}</h1>
            <p>
              {[p.city, p.mood && `mood: ${p.mood}`]
                .filter(Boolean)
                .join(" · ") || "quietly making the web more personal"}
            </p>
          </div>
          {isOwner ? (
            <Link
              className="secondary-button owner-edit-button"
              href="/settings"
            >
              Edit page
            </Link>
          ) : (
            user &&
            (friendship ? (
              <span className="secondary-button">{friendship.status}</span>
            ) : (
              <form action={requestFriend}>
                <input type="hidden" name="user_id" value={p.id} />
                <button className="secondary-button">+ Add friend</button>
              </form>
            ))
          )}
        </section>
        {p.profile_song_title && (
          <section className="profile-player">
            <span>▶</span>
            <div>
              <small>PROFILE SONG · NEVER AUTOPLAYS</small>
              {p.profile_song_url ? (
                <a href={p.profile_song_url} rel="noreferrer" target="_blank">
                  <b>{p.profile_song_title}</b>
                </a>
              ) : (
                <b>{p.profile_song_title}</b>
              )}
            </div>
            <i>open external track ↗</i>
          </section>
        )}
        <div className="profile-columns">
          <div>
            <section className="page-module">
              <div className="module-title">
                <span>ABOUT ME</span>
                <i>01</i>
              </div>
              <p className="profile-bio">
                {p.bio || "This page is still waiting for an About Me."}
              </p>
            </section>
            <section className="page-module">
              <div className="module-title">
                <span>GUESTBOOK</span>
                <i>
                  {p.comment_permission.toUpperCase()} · {comments?.length || 0}
                </i>
              </div>
              {canComment && (
                <form action={postProfileComment} className="composer">
                  <input type="hidden" name="profile_id" value={p.id} />
                  <input type="hidden" name="username" value={p.username} />
                  <label htmlFor="guestbook">Leave a note</label>
                  <textarea
                    id="guestbook"
                    name="body"
                    maxLength={3000}
                    required
                  />
                  <button className="primary">Sign guestbook</button>
                </form>
              )}
              {user && !canComment && (
                <p className="control-note">
                  This member limits guestbook notes to{" "}
                  {p.comment_permission === "friends"
                    ? "accepted friends"
                    : "nobody"}
                  .
                </p>
              )}
              {comments?.length ? (
                comments.map((c: any) => (
                  <article className="comment" key={c.id}>
                    <div className="avatar">
                      {c.profiles?.display_name?.[0] || "?"}
                    </div>
                    <div>
                      <b>{c.profiles?.display_name || c.profiles?.username}</b>
                      <time>{new Date(c.created_at).toLocaleDateString()}</time>
                      <p>{c.body}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty compact">
                  <b>No notes yet.</b>
                  <p>The guestbook is quiet.</p>
                </div>
              )}
            </section>
          </div>
          <aside>
            {!hideCircle && (
              <section className="page-module circle-module">
                <div className="module-title">
                  <span>{String(circleLabel).toUpperCase()}</span>
                  <i>OPTIONAL</i>
                </div>
                {circle?.length ? (
                  <div className="circle-grid">
                    {circle.map((f: any) => (
                      <Link
                        key={f.position}
                        href={`/u/${f.profiles?.username}`}
                      >
                        <div>{f.profiles?.display_name?.[0] || "?"}</div>
                        <b>
                          {f.profiles?.display_name || f.profiles?.username}
                        </b>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty compact">
                    <b>The circle is open.</b>
                    <p>This member has not chosen their people yet.</p>
                  </div>
                )}
              </section>
            )}
            <section className="page-module page-signal-card">
              <div className="module-title">
                <span>PAGE SIGNAL</span>
                <i>LIVE</i>
              </div>
              <div className="signal-orbit" aria-hidden="true"><i/><i/><i/></div>
              <strong>{theme.signal_line || p.mood || "quietly online"}</strong>
              <p>♫ {p.profile_song_title || "no song selected"} · ☻ {theme.signal_status || "open to a quiet hello"}</p>
              <ShareSignal title={`${p.display_name || p.username} on LoudPage`} text={`${theme.signal_line || p.mood || "quietly online"} · ${theme.signal_status || "open to a quiet hello"}`} url={`https://synalepha.org/u/${p.username}`} />
            </section>
            {user && !isOwner && (
              <details className="safety-tools">
                <summary>Safety &amp; boundaries</summary>
                <form action={reportMember}>
                  <input type="hidden" name="user_id" value={p.id} />
                  <label>
                    What should moderators know?
                    <textarea name="details" maxLength={1000} required />
                  </label>
                  <button>Report privately</button>
                </form>
                <form action={blockMember}>
                  <input type="hidden" name="user_id" value={p.id} />
                  <button className="danger-button">Block this member</button>
                </form>
              </details>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
