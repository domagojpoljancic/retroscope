import { readFromStorage, writeToStorage } from "@/lib/storage";

const IDENTITY_NAMESPACE = "participant-identity-v1";

export interface ParticipantIdentity {
  participantId: string;
  participantToken: string;
  displayName: string;
}

type IdentityMap = Record<string, ParticipantIdentity>;

function readMap(): IdentityMap {
  return readFromStorage<IdentityMap>(IDENTITY_NAMESPACE, {});
}

export function getStoredIdentity(sessionId: string): ParticipantIdentity | null {
  return readMap()[sessionId] ?? null;
}

export function storeIdentity(
  sessionId: string,
  identity: ParticipantIdentity,
): void {
  const map = readMap();
  map[sessionId] = identity;
  writeToStorage(IDENTITY_NAMESPACE, map);
}

export function clearIdentity(sessionId: string): void {
  const map = readMap();
  delete map[sessionId];
  writeToStorage(IDENTITY_NAMESPACE, map);
}
