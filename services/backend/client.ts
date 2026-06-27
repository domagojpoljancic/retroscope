import "server-only";

import {
  isSupabaseServerConfigured,
} from "@/lib/supabase/config";
import { mockBackend } from "@/services/backend/mockBackend";
import type { BackendClient } from "@/services/backend/types";

/** Server-side backend — uses Supabase when fully configured, otherwise mock. */
export function getServerBackend(): BackendClient {
  if (isSupabaseServerConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseBackend } = require("@/services/backend/supabaseBackend") as typeof import("@/services/backend/supabaseBackend");
    return supabaseBackend;
  }
  return mockBackend;
}
