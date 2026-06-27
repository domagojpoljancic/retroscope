import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Participant } from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface JoinSessionInput {
  sessionId: string;
  displayName: string;
  userId?: string | null;
  isFacilitatorParticipant?: boolean;
}

export const participantService = {
  listBySession(sessionId: string): Participant[] {
    return getMockStore().participants.filter(
      (participant) => participant.sessionId === sessionId,
    );
  },

  getById(participantId: string): Participant | null {
    return findById(getMockStore().participants, participantId) ?? null;
  },

  getByToken(participantToken: string): Participant | null {
    return (
      getMockStore().participants.find(
        (participant) => participant.participantToken === participantToken,
      ) ?? null
    );
  },

  join(input: JoinSessionInput): Participant {
    const joinedAt = nowIso();
    const participant: Participant = {
      id: createId("participant"),
      sessionId: input.sessionId,
      displayName: input.displayName,
      participantToken: createId("token"),
      userId: input.userId ?? null,
      isFacilitatorParticipant: input.isFacilitatorParticipant ?? false,
      joinedAt,
      lastSeenAt: joinedAt,
    };

    updateMockStore((state) => ({
      ...state,
      participants: [...state.participants, participant],
    }));

    return participant;
  },

  updateLastSeen(participantId: string): Participant {
    let updated: Participant | null = null;

    updateMockStore((state) => {
      const participants = state.participants.map((participant) => {
        if (participant.id !== participantId) {
          return participant;
        }
        updated = { ...participant, lastSeenAt: nowIso() };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Participant", participantId);
      }

      return { ...state, participants };
    });

    return updated!;
  },

  remove(participantId: string): void {
    updateMockStore((state) => ({
      ...state,
      participants: state.participants.filter(
        (participant) => participant.id !== participantId,
      ),
    }));
  },
};
