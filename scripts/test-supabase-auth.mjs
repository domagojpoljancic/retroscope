import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const testEmail = `retroscope-test-${Date.now()}@example.com`;
const password = "TestPassword123!";

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email: testEmail,
  password,
  email_confirm: true,
  user_metadata: { display_name: "RetroScope Test" },
});

if (createError) {
  console.error("FAIL auth:createUser", createError.message);
  process.exit(1);
}

const userId = created.user?.id;
if (!userId) {
  console.error("FAIL auth:createUser — no user id returned");
  process.exit(1);
}

await new Promise((r) => setTimeout(r, 1500));

const { data: profile } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
const { data: member } = await admin
  .from("workspace_members")
  .select("*, workspaces(*)")
  .eq("user_id", userId)
  .maybeSingle();

const publishable =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, publishable);

const { error: signInError } = await client.auth.signInWithPassword({
  email: testEmail,
  password,
});

if (signInError) {
  console.error("FAIL auth:signIn", signInError.message);
} else {
  console.log("PASS auth:signIn");
}

if (profile) console.log("PASS bootstrap:profile");
else console.error("FAIL bootstrap:profile — trigger may not have run");

if (member) console.log("PASS bootstrap:workspace_member");
else console.error("FAIL bootstrap:workspace_member");

await admin.auth.admin.deleteUser(userId);
console.log("PASS cleanup:test_user_deleted");

if (!profile || !member || signInError) process.exit(1);

console.log("\nAuth bootstrap smoke test passed");
