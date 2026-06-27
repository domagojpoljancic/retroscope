/** Client-safe check for Supabase mode (public env vars only). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseMode(): boolean {
  return isSupabaseConfigured();
}

export function getBackendMode(): "mock" | "supabase" {
  return isSupabaseMode() ? "supabase" : "mock";
}
