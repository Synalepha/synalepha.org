import assert from "node:assert/strict";
import fs from "node:fs";

const migrations = [
  "001_initial.sql",
  "002_security_hardening.sql",
  "003_age_aware_safety.sql",
  "004_visible_safety_and_customization.sql",
]
  .map((name) =>
    fs.readFileSync(
      new URL(`../supabase/migrations/${name}`, import.meta.url),
      "utf8",
    ),
  )
  .join("\n")
  .toLowerCase();
const tables = [
  "profiles",
  "friendships",
  "top_friends",
  "blocks",
  "bulletins",
  "blog_posts",
  "profile_comments",
  "conversations",
  "conversation_members",
  "messages",
  "albums",
  "media",
  "notifications",
  "reports",
  "admins",
];
for (const table of tables)
  assert(
    migrations.includes(`alter table ${table} enable row level security`),
    `${table} is missing RLS`,
  );
for (const fn of [
  "is_admin",
  "are_friends",
  "is_blocked",
  "can_view_profile",
  "is_conversation_member",
  "start_conversation",
])
  assert(
    migrations.includes(`revoke all on function public.${fn}`),
    `${fn} keeps default execution grants`,
  );
for (const rule of [
  "same_age_band(requester_id,addressee_id)",
  "not public.is_minor(owner)",
  "public.are_friends(auth.uid(),other_user)",
  "moderation_state='pending'",
  "reporter_id=auth.uid()",
])
  assert(migrations.includes(rule), `missing authorization invariant: ${rule}`);
assert(
  migrations.includes("new.visibility='public'"),
  "minor public-visibility trigger is missing",
);
assert(
  migrations.includes("new.birth_date is distinct from old.birth_date"),
  "birth-date mutation guard is missing",
);
console.log(
  "PASS: every table has RLS and age, messaging, media, report, and function-grant invariants are present",
);
