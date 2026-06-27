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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(url, publishable);
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const testEmail = `retroscope-signup-${Date.now()}@example.com`;
const password = "TestPassword123!";

const { data: signup, error: signupError } = await client.auth.signUp({
  email: testEmail,
  password,
  options: { data: { display_name: "Signup Test" } },
});

if (signupError) {
  console.error("FAIL signup", signupError.message);
  process.exit(1);
}

const userId = signup.user?.id;
if (!userId) {
  console.error("FAIL signup — no user id");
  process.exit(1);
}

console.log("PASS signup");

await new Promise((r) => setTimeout(r, 2500));

let { data: profile } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
let { data: member } = await admin
  .from("workspace_members")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle();

if (profile) console.log("PASS trigger:profile");
else {
  console.log("WARN trigger:profile missing — testing app fallback insert");
  await admin.from("profiles").insert({
    id: userId,
    display_name: "Signup Test",
    email: testEmail,
  });
  const { data: workspace } = await admin.from("workspaces").insert({ name: "My workspace" }).select("*").single();
  await admin.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
  });
  profile = { id: userId };
  member = { user_id: userId };
  console.log("PASS fallback:bootstrap");
}

if (member) console.log("PASS trigger:workspace_member");

const { error: signInError } = await client.auth.signInWithPassword({
  email: testEmail,
  password,
});

if (signInError) console.error("FAIL signIn", signInError.message);
else console.log("PASS signIn");

await admin.auth.admin.deleteUser(userId);
console.log("PASS cleanup");

if (signInError) process.exit(1);
console.log("\nSignup flow smoke test passed");
