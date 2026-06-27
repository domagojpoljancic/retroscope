import { getStoredIdentity } from "@/lib/identity";
import type { ParticipantContext } from "@/services/backend/types";

export function getParticipantContext(sessionId: string): ParticipantContext | null {
  const identity = getStoredIdentity(sessionId);
  if (!identity) {
    return null;
  }
  return {
    participantId: identity.participantId,
    participantToken: identity.participantToken,
    sessionId,
  };
}
