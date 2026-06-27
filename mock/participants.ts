import { daysAgo } from "@/lib/dates";
import type { Participant } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

const sessionId = MOCK_IDS.session;
const joinedAt = daysAgo(0);

export const mockParticipants: Participant[] = [
  {
    id: MOCK_IDS.participants.alex,
    sessionId,
    displayName: "Alex Morgan",
    participantToken: "token-alex",
    userId: MOCK_IDS.users.alex,
    isFacilitatorParticipant: true,
    joinedAt,
    lastSeenAt: joinedAt,
  },
  {
    id: MOCK_IDS.participants.marta,
    sessionId,
    displayName: "Marta Novak",
    participantToken: "token-marta",
    userId: MOCK_IDS.users.marta,
    isFacilitatorParticipant: false,
    joinedAt,
    lastSeenAt: joinedAt,
  },
  {
    id: MOCK_IDS.participants.jamie,
    sessionId,
    displayName: "Jamie Lee",
    participantToken: "token-jamie",
    userId: MOCK_IDS.users.jamie,
    isFacilitatorParticipant: false,
    joinedAt,
    lastSeenAt: joinedAt,
  },
  {
    id: MOCK_IDS.participants.priya,
    sessionId,
    displayName: "Priya Shah",
    participantToken: "token-priya",
    userId: MOCK_IDS.users.priya,
    isFacilitatorParticipant: false,
    joinedAt,
    lastSeenAt: joinedAt,
  },
  {
    id: MOCK_IDS.participants.tom,
    sessionId,
    displayName: "Tom Becker",
    participantToken: "token-tom",
    userId: MOCK_IDS.users.tom,
    isFacilitatorParticipant: false,
    joinedAt,
    lastSeenAt: joinedAt,
  },
  {
    id: MOCK_IDS.participants.sara,
    sessionId,
    displayName: "Sara Kim",
    participantToken: "token-sara",
    userId: MOCK_IDS.users.sara,
    isFacilitatorParticipant: false,
    joinedAt,
    lastSeenAt: joinedAt,
  },
];
