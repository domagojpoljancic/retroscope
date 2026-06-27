import { mockActionBoardShare, mockActionItems, mockActionSuggestions, mockCompletedActionItems, mockPreviousActionItems, mockSessionActionItems } from "@/mock/actions";
import { mockRetroCards } from "@/mock/cards";
import { mockCardGroups, mockGroupingEvents } from "@/mock/groups";
import { DEMO_SESSION_ID, MOCK_IDS } from "@/mock/ids";
import { mockParticipants } from "@/mock/participants";
import { facilitatorProfile, mockProfiles } from "@/mock/profiles";
import { mockDemoSession, mockSessions } from "@/mock/session";
import { mockTimerStates, mockVotes, mockVotingSettings } from "@/mock/voting";
import { mockWarmupResponses } from "@/mock/warmup-responses";
import { mockWorkspace, mockWorkspaceMembers } from "@/mock/workspace";
import type {
  ActionBoardShare,
  ActionItem,
  ActionSuggestion,
  CardGroup,
  GroupingEvent,
  Participant,
  Profile,
  RetroCard,
  Session,
  TimerState,
  Vote,
  VotingSettings,
  WarmupResponse,
  Workspace,
  WorkspaceMember,
} from "@/types";

export interface MockDataState {
  profiles: Profile[];
  workspace: Workspace;
  workspaceMembers: WorkspaceMember[];
  sessions: Session[];
  participants: Participant[];
  warmupResponses: WarmupResponse[];
  cards: RetroCard[];
  groups: CardGroup[];
  groupingEvents: GroupingEvent[];
  votingSettings: VotingSettings[];
  votes: Vote[];
  timers: TimerState[];
  actionSuggestions: ActionSuggestion[];
  actionItems: ActionItem[];
  actionBoardShares: ActionBoardShare[];
}

export function createInitialMockState(): MockDataState {
  return {
    profiles: [...mockProfiles],
    workspace: { ...mockWorkspace },
    workspaceMembers: [...mockWorkspaceMembers],
    sessions: mockSessions.map((session) => ({ ...session })),
    participants: mockParticipants.map((participant) => ({ ...participant })),
    warmupResponses: mockWarmupResponses.map((response) => ({ ...response })),
    cards: mockRetroCards.map((card) => ({ ...card })),
    groups: mockCardGroups.map((group) => ({ ...group })),
    groupingEvents: mockGroupingEvents.map((event) => ({ ...event })),
    votingSettings: [{ ...mockVotingSettings }],
    votes: mockVotes.map((vote) => ({ ...vote })),
    timers: mockTimerStates.map((timer) => ({ ...timer })),
    actionSuggestions: mockActionSuggestions.map((suggestion) => ({ ...suggestion })),
    actionItems: mockActionItems.map((item) => ({ ...item })),
    actionBoardShares: [{ ...mockActionBoardShare }],
  };
}

export {
  DEMO_SESSION_ID,
  MOCK_IDS,
  facilitatorProfile,
  mockActionBoardShare,
  mockActionItems,
  mockActionSuggestions,
  mockCardGroups,
  mockCompletedActionItems,
  mockDemoSession,
  mockGroupingEvents,
  mockParticipants,
  mockPreviousActionItems,
  mockProfiles,
  mockRetroCards,
  mockSessionActionItems,
  mockSessions,
  mockTimerStates,
  mockVotes,
  mockVotingSettings,
  mockWarmupResponses,
  mockWorkspace,
  mockWorkspaceMembers,
};

// Backward-compatible exports used by existing placeholders
export const demoSession = mockDemoSession;
export const demoActionItems = mockSessionActionItems;
