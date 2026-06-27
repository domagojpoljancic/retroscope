"use server";

import { revalidatePath } from "next/cache";

import { getServerBackend } from "@/services/backend/client";
import type { ParticipantContext } from "@/services/backend/types";
import type { CreateSessionInput, UpdateSessionInput } from "@/services/sessionService";
import type { Session, SessionPhase } from "@/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : "Something went wrong",
    }));
}

export async function getSessionByCodeAction(sessionCode: string) {
  return toResult(() => getServerBackend().getSessionByCode(sessionCode));
}

export async function getSessionSnapshotAction(sessionId: string) {
  return toResult(() => getServerBackend().getSessionSnapshot(sessionId));
}

export async function createSessionAction(input: CreateSessionInput) {
  return toResult(async () => {
    const backend = getServerBackend();
    const auth = await backend.getAuthContext();
    if (auth && backend.mode === "supabase") {
      input = {
        ...input,
        workspaceId: auth.workspace.id,
        createdByUserId: auth.userId,
      };
    }
    const session = await backend.createSession(input);
    revalidatePath("/dashboard");
    return session;
  });
}

export async function updateSessionAction(sessionId: string, input: UpdateSessionInput) {
  return toResult(async () => {
    const session = await getServerBackend().updateSession(sessionId, input);
    revalidatePath(`/session/${sessionId}`);
    return session;
  });
}

export async function advanceSessionPhaseAction(sessionId: string, nextPhase: SessionPhase) {
  return toResult(async () => {
    const session = await getServerBackend().advanceSessionPhase(sessionId, nextPhase);
    revalidatePath(`/session/${sessionId}`);
    return session;
  });
}

export async function startSessionAction(sessionId: string) {
  return toResult(async () => {
    const session = await getServerBackend().startSession(sessionId);
    revalidatePath(`/session/${sessionId}`);
    return session;
  });
}

export async function completeSessionAction(sessionId: string) {
  return toResult(async () => {
    const session = await getServerBackend().completeSession(sessionId);
    revalidatePath(`/session/${sessionId}`);
    return session;
  });
}

export async function joinSessionAction(input: {
  sessionId: string;
  displayName: string;
  userId?: string | null;
  isFacilitatorParticipant?: boolean;
}) {
  return toResult(() => getServerBackend().joinSession(input));
}

export async function listSessionsByWorkspaceAction(workspaceId: string): Promise<ActionResult<Session[]>> {
  return toResult(() => getServerBackend().listSessionsByWorkspace(workspaceId));
}

export type { ParticipantContext };
