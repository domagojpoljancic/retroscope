import { daysAgo } from "@/lib/dates";
import type { TimerState, Vote, VotingSettings } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

const sessionId = MOCK_IDS.session;

export const mockVotingSettings: VotingSettings = {
  sessionId,
  votesPerParticipant: 3,
  allowMultipleVotesPerTarget: false,
};

export const mockVotes: Vote[] = [
  {
    id: "vote-1",
    sessionId,
    participantId: MOCK_IDS.participants.marta,
    targetType: "group",
    targetCardId: null,
    targetGroupId: MOCK_IDS.groups.planningClarity,
    createdAt: daysAgo(0),
  },
  {
    id: "vote-2",
    sessionId,
    participantId: MOCK_IDS.participants.jamie,
    targetType: "group",
    targetCardId: null,
    targetGroupId: MOCK_IDS.groups.planningClarity,
    createdAt: daysAgo(0),
  },
  {
    id: "vote-3",
    sessionId,
    participantId: MOCK_IDS.participants.priya,
    targetType: "group",
    targetCardId: null,
    targetGroupId: MOCK_IDS.groups.releaseReadiness,
    createdAt: daysAgo(0),
  },
  {
    id: "vote-4",
    sessionId,
    participantId: MOCK_IDS.participants.tom,
    targetType: "group",
    targetCardId: null,
    targetGroupId: MOCK_IDS.groups.releaseReadiness,
    createdAt: daysAgo(0),
  },
  {
    id: "vote-5",
    sessionId,
    participantId: MOCK_IDS.participants.sara,
    targetType: "card",
    targetCardId: "card-6",
    targetGroupId: null,
    createdAt: daysAgo(0),
  },
  {
    id: "vote-6",
    sessionId,
    participantId: MOCK_IDS.participants.alex,
    targetType: "group",
    targetCardId: null,
    targetGroupId: MOCK_IDS.groups.planningClarity,
    createdAt: daysAgo(0),
  },
];

export const mockTimerStates: TimerState[] = [
  {
    id: MOCK_IDS.timers.writing,
    sessionId,
    phase: "writing",
    durationSeconds: 600,
    startedAt: daysAgo(0),
    pausedAt: null,
    endsAt: daysAgo(0),
    status: "ended",
  },
  {
    id: MOCK_IDS.timers.voting,
    sessionId,
    phase: "voting",
    durationSeconds: 300,
    startedAt: daysAgo(0),
    pausedAt: null,
    endsAt: daysAgo(0),
    status: "ended",
  },
];
