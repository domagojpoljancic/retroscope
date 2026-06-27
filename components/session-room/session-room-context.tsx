"use client";

import { createContext, useContext } from "react";

import type { FrameworkColumnDefinition } from "@/lib/framework-columns";
import type {
  ActionItem,
  ActionSuggestion,
  CardGroup,
  GroupingEvent,
  Participant,
  RetroCard,
  Session,
  SessionPhase,
  TimerState,
  Vote,
  VotingSettings,
  WarmupResponse,
} from "@/types";

export interface RoomViewer {
  key: string;
  label: string;
  participantId: string | null;
  isFacilitator: boolean;
}

/** Session-scoped store view used by phase components. */
export interface SessionStoreView {
  cards: RetroCard[];
  groups: CardGroup[];
  groupingEvents: GroupingEvent[];
  votes: Vote[];
  votingSettings: VotingSettings[];
  timers: TimerState[];
  warmupResponses: WarmupResponse[];
  actionSuggestions: ActionSuggestion[];
  actionItems: ActionItem[];
}

export interface SessionRoomContextValue {
  session: Session;
  store: SessionStoreView;
  participants: Participant[];
  columns: FrameworkColumnDefinition[];
  viewer: RoomViewer;
  hasActionReview: boolean;
  goToPhase: (phase: SessionPhase) => void;
  advance: () => void;
  back: () => void;
  participantName: (participantId: string | null) => string;
}

const SessionRoomContext = createContext<SessionRoomContextValue | null>(null);

export function SessionRoomProvider({
  value,
  children,
}: {
  value: SessionRoomContextValue;
  children: React.ReactNode;
}) {
  return (
    <SessionRoomContext.Provider value={value}>
      {children}
    </SessionRoomContext.Provider>
  );
}

export function useRoom(): SessionRoomContextValue {
  const ctx = useContext(SessionRoomContext);
  if (!ctx) {
    throw new Error("useRoom must be used within a SessionRoomProvider");
  }
  return ctx;
}

export function snapshotToStoreView(snapshot: {
  cards: RetroCard[];
  groups: CardGroup[];
  groupingEvents: GroupingEvent[];
  votes: Vote[];
  votingSettings: VotingSettings | null;
  timers: TimerState[];
  warmupResponses: WarmupResponse[];
  actionSuggestions: ActionSuggestion[];
  actionItems: ActionItem[];
}): SessionStoreView {
  return {
    cards: snapshot.cards,
    groups: snapshot.groups,
    groupingEvents: snapshot.groupingEvents,
    votes: snapshot.votes,
    votingSettings: snapshot.votingSettings ? [snapshot.votingSettings] : [],
    timers: snapshot.timers,
    warmupResponses: snapshot.warmupResponses,
    actionSuggestions: snapshot.actionSuggestions,
    actionItems: snapshot.actionItems,
  };
}
