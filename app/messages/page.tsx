import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { startMessage } from "@/app/actions";
export default async function Messages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: me }, { data: friends }, { data: messages }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username,display_name,avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("friendships")
        .select(
          "requester_id,addressee_id,requester:profiles!friendships_requester_id_fkey(id,username,display_name),addressee:profiles!friendships_addressee_id_fkey(id,username,display_name)",
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
      supabase
        .from("messages")
        .select(
          "id,body,created_at,sender_id,profiles!messages_sender_id_fkey(display_name,username)",
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
  const people = (friends || []).map((r: any) =>
    r.requester_id === user.id ? r.addressee : r.requester,
  );
  return (
    <AppShell
      profile={me || { username: null, display_name: null, avatar_url: null }}
    >
      <div className="directory-page">
        <p className="eyebrow">MESSAGES</p>
        <h1>Your inbox</h1>
        {people.length > 0 ? (
          <form action={startMessage} className="composer">
            <label>
              Send to
              <select name="recipient_id" required>
                {people.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name || p.username}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea name="body" maxLength={10000} required />
            </label>
            <button className="primary">Send privately</button>
          </form>
        ) : (
          <div className="empty">
            <b>Add a friend to start messaging.</b>
            <p>Only people you intentionally connect with appear here.</p>
          </div>
        )}
        <section>
          {messages?.map((m: any) => (
            <article className="bulletin" key={m.id}>
              <div className="avatar">
                {m.profiles?.display_name?.[0] || "?"}
              </div>
              <div>
                <b>{m.profiles?.display_name || m.profiles?.username}</b>
                <time>{new Date(m.created_at).toLocaleString()}</time>
                <p>{m.body}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
