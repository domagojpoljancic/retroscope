import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseServerConfigured,
} from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any> | null = null;

/**
 * Service-role client for server-side operations that validate
 * participant tokens or share tokens before writing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseAdminClient(): SupabaseClient<any> {
  if (!isSupabaseServerConfigured()) {
    throw new Error("Supabase server credentials are not configured");
  }

  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
