"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const credentials = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});
export type AuthState = { error: string; success: string };
function createEmailAuthClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
export async function signUp(_: unknown, form: FormData) {
  const parsed = credentials
    .extend({ birth_date: z.iso.date() })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error:
        "Use a valid email, birth date, and password of at least 8 characters.",
      success: "",
    };
  const age = Math.floor(
    (Date.now() - new Date(`${parsed.data.birth_date}T00:00:00Z`).getTime()) /
      (365.2425 * 86400000),
  );
  if (age < 13)
    return { error: "LoudPage is for people age 13 and older.", success: "" };
  const supabase = createEmailAuthClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { email, password, birth_date } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { birth_date, is_minor: age < 18 },
      emailRedirectTo: `${origin}/auth/complete?next=/settings`,
    },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message))
      return {
        error:
          "An account already exists for this email. Your existing account and data were preserved. Log in or reset its password instead.",
        success: "",
      };
    return { error: error.message, success: "" };
  }
  if (data.user && data.user.identities?.length === 0)
    return {
      error:
        "An account already exists for this email. Nothing was overwritten. Go to Log in and use “Reset my password” if needed.",
      success: "",
    };
  return {
    success:
      "Account created. Check your email for a LoudPage confirmation link. Your page and future activity stay attached to this one account.",
    error: "",
  };
}
export async function signIn(_: unknown, form: FormData) {
  const parsed = credentials.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Check your email and password.", success: "" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error)
    return {
      error:
        "That email and password combination did not work. If you already confirmed this account, reset its password below instead of creating another account.",
      success: "",
    };
  redirect("/home");
}
export async function resendConfirmation(
  _: unknown,
  form: FormData,
): Promise<AuthState> {
  const email = z.email().safeParse(form.get("email"));
  if (!email.success)
    return {
      error: "Enter the email address used to create your account.",
      success: "",
    };
  const supabase = createEmailAuthClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.data,
    options: { emailRedirectTo: `${origin}/auth/complete?next=/settings` },
  });
  if (error)
    return {
      error:
        "We could not send a confirmation email right now. Wait a moment and try again.",
      success: "",
    };
  return {
    error: "",
    success:
      "A fresh confirmation link has been sent. Use the newest email only.",
  };
}
export async function requestPasswordReset(
  _: unknown,
  form: FormData,
): Promise<AuthState> {
  const email = z.email().safeParse(form.get("email"));
  if (!email.success)
    return {
      error: "Enter the email address for your existing account.",
      success: "",
    };
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message, success: "" };
  return {
    error: "",
    success:
      "If an account exists for that email, a password-reset link is on its way.",
  };
}
export async function updatePassword(
  _: unknown,
  form: FormData,
): Promise<AuthState> {
  const parsed = z
    .object({
      password: z.string().min(8).max(128),
      confirm_password: z.string(),
    })
    .refine((v) => v.password === v.confirm_password, {
      message: "Passwords do not match.",
      path: ["confirm_password"],
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ||
        "Use a password of at least 8 characters.",
      success: "",
    };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error:
        "This reset session is missing or expired. Request a fresh password-reset email.",
      success: "",
    };
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message, success: "" };
  return {
    error: "",
    success: "Password updated. You can now continue to your neighborhood.",
  };
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
export async function signOutEverywhere() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect(
    "/login?error=You%20have%20been%20signed%20out%20on%20every%20device.",
  );
}
export async function deleteAccount(
  _: unknown,
  form: FormData,
): Promise<AuthState> {
  if (form.get("confirmation") !== "DELETE MY ACCOUNT")
    return { error: "Type DELETE MY ACCOUNT exactly to confirm.", success: "" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "Your session expired. Log in again before deleting your account.",
      success: "",
    };
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey)
    return {
      error: "Account deletion is temporarily unavailable. Contact support.",
      success: "",
    };
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error)
    return {
      error:
        "We could not delete the account. Nothing was changed. Contact support.",
      success: "",
    };
  redirect("/");
}
export async function postBulletin(form: FormData) {
  const body = z.string().min(1).max(2000).safeParse(form.get("body"));
  if (!body.success) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase
    .from("bulletins")
    .insert({ author_id: user.id, body: body.data });
  if (error)
    throw new Error("Your bulletin could not be posted. Please try again.");
  revalidatePath("/home");
}

const profileInput = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_]{3,24}$/,
      "Use 3–24 lowercase letters, numbers, or underscores.",
    ),
  display_name: z.string().trim().min(1).max(50),
  bio: z.string().trim().max(5000),
  mood: z.string().trim().max(80),
  city: z.string().trim().max(80),
  profile_song_title: z.string().trim().max(160),
  profile_song_url: z.union([z.literal(""), z.url()]),
  visibility: z.enum(["public", "friends", "private"]),
  comment_permission: z.enum(["everyone", "friends", "nobody"]),
  allow_tags: z.enum(["on"]).optional(),
  discoverable: z.enum(["on"]).optional(),
  search_indexing: z.enum(["on"]).optional(),
  theme_preset: z.enum(["classic", "midnight", "sunset", "paper"]),
  theme_font: z.enum(["clean", "mono", "serif"]),
  theme_density: z.enum(["compact", "comfortable", "spacious"]),
  inner_circle_label: z.string().trim().min(1).max(32),
  hide_inner_circle: z.enum(["on"]).optional(),
  theme_accent: z.enum(["violet", "cyan", "pink", "orange"]),
  signal_line: z.string().trim().max(60),
  signal_status: z.string().trim().max(80),
  module_order: z.enum(["about,signal,song,circle,guestbook", "signal,about,song,circle,guestbook", "song,signal,about,circle,guestbook"]),
});
export async function updateProfile(
  _: unknown,
  form: FormData,
): Promise<AuthState> {
  const parsed = profileInput.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message || "Check your profile details.",
      success: "",
    };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const {
    theme_preset,
    theme_font,
    theme_density,
    inner_circle_label,
    hide_inner_circle,
    theme_accent,
    signal_line,
    signal_status,
    module_order,
    allow_tags,
    discoverable,
    search_indexing,
    ...details
  } = parsed.data;
  const payload = {
    ...details,
    allow_tags: allow_tags === "on",
    discoverable: discoverable === "on",
    search_indexing: search_indexing === "on",
    theme: {
      preset: theme_preset,
      font: theme_font,
      density: theme_density,
      inner_circle_label,
      hide_inner_circle: hide_inner_circle === "on",
      accent: theme_accent,
      signal_line,
      signal_status,
      module_order,
    },
    profile_song_url: details.profile_song_url || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);
  if (error)
    return {
      error:
        error.code === "23505"
          ? "That username is already taken."
          : error.message,
      success: "",
    };
  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath(`/u/${parsed.data.username}`);
  return { error: "", success: "Your page is updated." };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
export async function requestFriend(form: FormData) {
  const addressee = z.uuid().parse(form.get("user_id"));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("friendships")
    .insert({
      requester_id: user.id,
      addressee_id: addressee,
      status: "pending",
    });
  if (error)
    throw new Error(
      error.code === "42501"
        ? "For safety, friendship requests stay within adult or under-18 age groups."
        : "That friend request could not be sent.",
    );
  revalidatePath("/friends");
}
export async function answerFriendRequest(form: FormData) {
  const parsed = z
    .object({
      requester_id: z.uuid(),
      decision: z.enum(["accepted", "declined"]),
    })
    .parse(Object.fromEntries(form));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("friendships")
    .update({ status: parsed.decision, updated_at: new Date().toISOString() })
    .eq("requester_id", parsed.requester_id)
    .eq("addressee_id", user.id)
    .eq("status", "pending");
  if (error) throw new Error("That request could not be updated.");
  revalidatePath("/friends");
  revalidatePath("/home");
}
export async function removeFriend(form: FormData) {
  const other = z.uuid().parse(form.get("user_id"));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${user.id})`,
    );
  if (error) throw new Error("That friendship could not be removed.");
  revalidatePath("/friends");
}
export async function postProfileComment(form: FormData) {
  const parsed = z
    .object({
      profile_id: z.uuid(),
      username: z.string(),
      body: z.string().trim().min(1).max(3000),
    })
    .parse(Object.fromEntries(form));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profile_comments")
    .insert({
      profile_id: parsed.profile_id,
      author_id: user.id,
      body: parsed.body,
    });
  if (error) throw new Error("Your guestbook note could not be posted.");
  revalidatePath(`/u/${parsed.username}`);
}
export async function blockMember(form: FormData) {
  const blocked = z.uuid().parse(form.get("user_id"));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: blocked });
  if (error && error.code !== "23505")
    throw new Error("That member could not be blocked.");
  redirect("/discover");
}
export async function reportMember(form: FormData) {
  const parsed = z
    .object({ user_id: z.uuid(), details: z.string().trim().max(1000) })
    .parse(Object.fromEntries(form));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: "profile",
      target_id: parsed.user_id,
      reason: "Profile or behavior concern",
      details: parsed.details || null,
    });
  if (error) throw new Error("The report could not be submitted.");
  revalidatePath("/admin");
  redirect("/account/reports?submitted=1");
}
export async function startMessage(form: FormData) {
  const parsed = z
    .object({
      recipient_id: z.uuid(),
      body: z.string().trim().min(1).max(10000),
    })
    .parse(Object.fromEntries(form));
  const { supabase, user } = await requireUser();
  const { data: allowed } = await supabase.rpc("are_friends", {
    a: user.id,
    b: parsed.recipient_id,
  });
  if (!allowed)
    throw new Error("Private messages require an accepted friendship.");
  const { data: conversation, error: startError } = await supabase.rpc(
    "start_conversation",
    { other_user: parsed.recipient_id },
  );
  if (startError) throw new Error("That conversation could not be started.");
  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation,
      sender_id: user.id,
      body: parsed.body,
    });
  if (error) throw new Error("Your message could not be sent.");
  revalidatePath("/messages");
}
export async function reviewReport(form: FormData) {
  const parsed = z
    .object({
      report_id: z.uuid(),
      status: z.enum(["reviewing", "resolved", "dismissed"]),
    })
    .parse(Object.fromEntries(form));
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("reports")
    .update({
      status: parsed.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.report_id);
  if (error) throw new Error("That report could not be updated.");
  revalidatePath("/admin");
}
export async function moderateMedia(form: FormData) {
  const parsed = z
    .object({
      media_id: z.uuid(),
      moderation_state: z.enum(["approved", "rejected"]),
    })
    .parse(Object.fromEntries(form));
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("media")
    .update({ moderation_state: parsed.moderation_state })
    .eq("id", parsed.media_id);
  if (error) throw new Error("That media item could not be moderated.");
  revalidatePath("/admin");
}
