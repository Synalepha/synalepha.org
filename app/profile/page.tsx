import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function MyProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (!data?.username) redirect("/settings");
  redirect(`/u/${data.username}`);
}
