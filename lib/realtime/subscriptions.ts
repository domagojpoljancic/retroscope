"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseMode } from "@/lib/backend-mode";

export type RealtimeTable =
  | "sessions"
  | "session_participants"
  | "warmup_responses"
  | "retro_cards"
  | "card_groups"
  | "grouping_events"
  | "session_timers"
  | "votes"
  | "action_suggestions"
  | "action_items";

export interface SessionRealtimeHandlers {
  onSessionChange?: () => void;
  onParticipantsChange?: () => void;
  onWarmupChange?: () => void;
  onCardsChange?: () => void;
  onGroupsChange?: () => void;
  onGroupingEventsChange?: () => void;
  onTimersChange?: () => void;
  onVotesChange?: () => void;
  onActionSuggestionsChange?: () => void;
  onActionItemsChange?: () => void;
}

const TABLE_HANDLER: Record<RealtimeTable, keyof SessionRealtimeHandlers> = {
  sessions: "onSessionChange",
  session_participants: "onParticipantsChange",
  warmup_responses: "onWarmupChange",
  retro_cards: "onCardsChange",
  card_groups: "onGroupsChange",
  grouping_events: "onGroupingEventsChange",
  session_timers: "onTimersChange",
  votes: "onVotesChange",
  action_suggestions: "onActionSuggestionsChange",
  action_items: "onActionItemsChange",
};

/**
 * Subscribe to postgres changes for a live session room.
 * Returns an unsubscribe function.
 */
export function subscribeToSessionRealtime(
  sessionId: string,
  handlers: SessionRealtimeHandlers,
): () => void {
  if (!isSupabaseMode()) {
    return () => {};
  }

  const supabase = getSupabaseBrowserClient();
  let channel: RealtimeChannel = supabase.channel(`session:${sessionId}`);

  const tables: RealtimeTable[] = [
    "sessions",
    "session_participants",
    "warmup_responses",
    "retro_cards",
    "card_groups",
    "grouping_events",
    "session_timers",
    "votes",
    "action_suggestions",
  ];

  for (const table of tables) {
    const handlerKey = TABLE_HANDLER[table];
    const handler = handlers[handlerKey];
    if (!handler) {
      continue;
    }

    const filterColumn = table === "sessions" ? "id" : "session_id";

    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter: `${filterColumn}=eq.${sessionId}`,
      },
      () => {
        handler();
      },
    );
  }

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Minimal subscriptions for phase/cards/participants/votes (MVP realtime).
 */
export function subscribeToCoreSessionRealtime(
  sessionId: string,
  onChange: () => void,
): () => void {
  return subscribeToSessionRealtime(sessionId, {
    onSessionChange: onChange,
    onParticipantsChange: onChange,
    onCardsChange: onChange,
    onVotesChange: onChange,
  });
}
