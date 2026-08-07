import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert(url && key, "Missing public Supabase test environment");
const anon = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const table of [
  "admins",
  "blocks",
  "conversation_members",
  "messages",
  "notifications",
  "reports",
]) {
  const { data, error } = await anon.from(table).select("*").limit(5);
  assert.ifError(error);
  assert.deepEqual(data, [], `anonymous rows leaked from ${table}`);
}

const fake = "00000000-0000-4000-8000-000000000001";
for (const [table, payload] of [
  ["bulletins", { author_id: fake, body: "unauthorized" }],
  [
    "reports",
    {
      reporter_id: fake,
      target_type: "profile",
      target_id: fake,
      reason: "unauthorized",
    },
  ],
  [
    "blocks",
    { blocker_id: fake, blocked_id: "00000000-0000-4000-8000-000000000002" },
  ],
]) {
  const { error } = await anon.from(table).insert(payload);
  assert(error, `anonymous insert unexpectedly reached ${table}`);
}

console.log("PASS: anonymous reads and writes are denied for sensitive tables");
