import { daysAgo } from "@/lib/dates";
import type { Session } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

export const mockDemoSession: Session = {
  id: MOCK_IDS.session,
  workspaceId: MOCK_IDS.workspace,
  createdByUserId: MOCK_IDS.users.alex,
  name: "Sprint 24 Retro",
  sessionCode: MOCK_IDS.sessionCode,
  warmupType: "mood_character",
  frameworkType: "start_stop_continue",
  anonymousCards: true,
  facilitatorParticipates: true,
  groupingPermission: "facilitator_only",
  currentPhase: "discussion",
  status: "active",
  createdAt: daysAgo(0),
  startedAt: daysAgo(0),
  endedAt: null,
};

export const mockSessions: Session[] = [mockDemoSession];
