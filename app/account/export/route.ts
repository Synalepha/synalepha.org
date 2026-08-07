import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const [profile, bulletins, comments, friendships, messages] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("bulletins").select("*").eq("author_id", user.id),
      supabase.from("profile_comments").select("*").eq("author_id", user.id),
      supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
      supabase.from("messages").select("*").eq("sender_id", user.id),
    ]);
  const failures = [profile, bulletins, comments, friendships, messages].filter(
    (result) => result.error,
  );
  if (failures.length)
    return Response.json(
      { error: "Your export could not be assembled." },
      { status: 500 },
    );
  const body = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email },
      profile: profile.data,
      bulletins: bulletins.data,
      comments: comments.data,
      friendships: friendships.data,
      messages: messages.data,
    },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="loudpage-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
