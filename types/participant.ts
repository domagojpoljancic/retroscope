export interface Participant {
  id: string;
  sessionId: string;
  displayName: string;
  participantToken: string;
  userId: string | null;
  isFacilitatorParticipant: boolean;
  joinedAt: string;
  lastSeenAt: string;
}
