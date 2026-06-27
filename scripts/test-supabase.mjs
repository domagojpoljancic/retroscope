import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
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

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
}

if (!url) fail("env:url", "NEXT_PUBLIC_SUPABASE_URL missing");
else pass("env:url", "set");

if (!publishable) fail("env:publishable", "publishable/anon key missing");
else pass("env:publishable", "set");

if (!serviceKey) fail("env:service", "SUPABASE_SERVICE_ROLE_KEY missing");
else pass("env:service", "set");

if (!url || !serviceKey) {
  printResults();
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = [
  "profiles",
  "workspaces",
  "workspace_members",
  "sessions",
  "session_participants",
  "retro_cards",
  "action_board_shares",
];

for (const table of tables) {
  const { error } = await admin.from(table).select("*", { head: true, count: "exact" });
  if (error) {
    fail(`table:${table}`, error.message);
  } else {
    pass(`table:${table}`, "reachable");
  }
}

const publicClient = publishable
  ? createClient(url, publishable, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

if (publicClient) {
  const { error } = await publicClient.auth.getSession();
  if (error) fail("auth:public", error.message);
  else pass("auth:public", "client initialized");
}

printResults();

function printResults() {
  console.log("\nSupabase connectivity test\n");
  for (const check of checks) {
    const icon = check.ok ? "PASS" : "FAIL";
    console.log(`${icon}  ${check.name} — ${check.detail}`);
  }
  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
  if (failed > 0) process.exit(1);
}
