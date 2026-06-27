"use client";

import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return browserClient;
}

export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient();
}
