import type { Participant, Session } from "@/types";

export interface SessionViewer {
  /** Stable key for the viewer switcher. */
  key: string;
  /** Label shown in the switcher (e.g. "Facilitator", "Marta"). */
  label: string;
  /** The participant this viewer acts as, if any. */
  participantId: string | null;
  /** Whether this viewer has facilitator controls. */
  isFacilitator: boolean;
}

export function findFacilitatorParticipant(
  session: Session,
  participants: Participant[],
): Participant | null {
  return (
    participants.find((participant) => participant.isFacilitatorParticipant) ??
    participants.find(
      (participant) => participant.userId === session.createdByUserId,
    ) ??
    null
  );
}

function firstName(displayName: string): string {
  return displayName.split(" ")[0] ?? displayName;
}

/**
 * Builds the prototype viewer list: a facilitator viewer plus one viewer per
 * non-facilitator participant. The facilitator viewer always exists so that
 * facilitator controls can be tested even before participants have joined.
 */
export function buildSessionViewers(
  session: Session,
  participants: Participant[],
): SessionViewer[] {
  const facilitator = findFacilitatorParticipant(session, participants);

  const facilitatorViewer: SessionViewer = {
    key: "facilitator",
    label: "Facilitator",
    participantId: facilitator?.id ?? null,
    isFacilitator: true,
  };

  const participantViewers: SessionViewer[] = participants
    .filter((participant) => participant.id !== facilitator?.id)
    .map((participant) => ({
      key: participant.id,
      label: firstName(participant.displayName),
      participantId: participant.id,
      isFacilitator: false,
    }));

  return [facilitatorViewer, ...participantViewers];
}
