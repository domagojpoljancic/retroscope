import "server-only";

import { canVoteOnTarget } from "@/lib/voting";
import { endTimer, pauseTimer, resumeTimer, startTimer } from "@/lib/timer";
import { isValidFrameworkColumn } from "@/lib/framework-columns";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mapActionBoardShare,
  mapActionItem,
  mapActionSuggestion,
  mapCardGroup,
  mapGroupingEvent,
  mapParticipant,
  mapProfile,
  mapRetroCard,
  mapSession,
  mapTimerState,
  mapVote,
  mapVotingSettings,
  mapWarmupResponse,
  mapWorkspace,
  mapWorkspaceMember,
} from "@/lib/supabase/mappers";
import type {
  AuthContext,
  BackendClient,
  ParticipantContext,
  SessionSnapshot,
} from "@/services/backend/types";
import type { GroupingEvent, TimerState } from "@/types";

async function admin() {
  return createSupabaseAdminClient();
}

async function authClient() {
  return createSupabaseServerClient();
}

async function resolveParticipant(ctx: ParticipantContext) {
  const db = await admin();
  const tokenHash = await hashToken(ctx.participantToken);
  const { data, error } = await db
    .from("session_participants")
    .select("*")
    .eq("id", ctx.participantId)
    .eq("participant_token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Invalid participant credentials");
  }
  if (ctx.sessionId && data.session_id !== ctx.sessionId) {
    throw new Error("Participant does not belong to this session");
  }
  return mapParticipant(data, ctx.participantToken);
}

async function canManageSession(userId: string, sessionId: string): Promise<boolean> {
  const db = await admin();
  const { data: session } = await db
    .from("sessions")
    .select("workspace_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) {
    return false;
  }
  const { data: member } = await db
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", session.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();
  return member?.role === "owner" || member?.role === "facilitator";
}

async function canManageSessionForTimer(timerId: string, userId: string): Promise<boolean> {
  const db = await admin();
  const { data: timer } = await db.from("session_timers").select("session_id").eq("id", timerId).maybeSingle();
  if (!timer) {
    return false;
  }
  return canManageSession(userId, timer.session_id);
}

async function loadAuthContext(userId: string): Promise<AuthContext | null> {
  const db = await admin();
  const { data: profileRow } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!profileRow) {
    return null;
  }

  const { data: memberRow } = await db
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!memberRow) {
    return null;
  }

  const workspaceRow = (memberRow as { workspaces: Record<string, unknown> }).workspaces;

  return {
    userId,
    profile: mapProfile(profileRow),
    workspace: mapWorkspace(workspaceRow),
    workspaceMember: mapWorkspaceMember(memberRow),
  };
}

async function listGroupingEvents(sessionId: string): Promise<GroupingEvent[]> {
  const db = await admin();
  const { data } = await db
    .from("grouping_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapGroupingEvent);
}

async function applyTimerTransition(
  timerId: string,
  transform: (timer: TimerState) => TimerState,
): Promise<TimerState> {
  const db = await admin();
  const { data: existing } = await db.from("session_timers").select("*").eq("id", timerId).maybeSingle();
  if (!existing) {
    throw new Error("Timer not found");
  }
  const next = transform(mapTimerState(existing));
  const { data, error } = await db
    .from("session_timers")
    .update({
      status: next.status,
      started_at: next.startedAt,
      paused_at: next.pausedAt,
      ends_at: next.endsAt,
      duration_seconds: next.durationSeconds,
    })
    .eq("id", timerId)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapTimerState(data);
}

export const supabaseBackend: BackendClient = {
  mode: "supabase",

  async getAuthContext() {
    const client = await authClient();
    const { data } = await client.auth.getUser();
    if (!data.user) {
      return null;
    }
    return loadAuthContext(data.user.id);
  },

  async signUp(email, password, displayName) {
    const client = await authClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Sign up failed");
    }
    return this.ensureAuthBootstrap(data.user.id, email, displayName);
  },

  async signIn(email, password) {
    const client = await authClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Sign in failed");
    }
    const ctx = await loadAuthContext(data.user.id);
    if (!ctx) {
      return this.ensureAuthBootstrap(
        data.user.id,
        data.user.email ?? email,
        (data.user.user_metadata?.display_name as string | undefined) ?? email.split("@")[0],
      );
    }
    return ctx;
  },

  async signOut() {
    const client = await authClient();
    await client.auth.signOut();
  },

  async getProfile(userId) {
    const db = await admin();
    const { data } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data ? mapProfile(data) : null;
  },

  async ensureAuthBootstrap(userId, email, displayName) {
    const db = await admin();
    const { data: existingProfile } = await db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile) {
      await db.from("profiles").insert({
        id: userId,
        display_name: displayName,
        email,
      });
    }

    const { data: memberRow } = await db
      .from("workspace_members")
      .select("*, workspaces(*)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (!memberRow) {
      const { data: workspace } = await db
        .from("workspaces")
        .insert({ name: "My workspace" })
        .select("*")
        .single();
      await db.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "owner",
      });
      return {
        userId,
        profile: mapProfile(
          existingProfile ?? {
            id: userId,
            display_name: displayName,
            email,
            created_at: new Date().toISOString(),
          },
        ),
        workspace: mapWorkspace(workspace),
        workspaceMember: {
          id: crypto.randomUUID(),
          workspaceId: workspace.id,
          userId,
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      };
    }

    const workspaceRow = (memberRow as { workspaces: Record<string, unknown> }).workspaces;
    return {
      userId,
      profile: mapProfile(existingProfile!),
      workspace: mapWorkspace(workspaceRow),
      workspaceMember: mapWorkspaceMember(memberRow),
    };
  },

  async listSessionsByWorkspace(workspaceId) {
    const db = await admin();
    const { data, error } = await db
      .from("sessions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map(mapSession);
  },

  async getSessionById(sessionId) {
    const db = await admin();
    const { data } = await db.from("sessions").select("*").eq("id", sessionId).maybeSingle();
    return data ? mapSession(data) : null;
  },

  async getSessionByCode(sessionCode) {
    const db = await admin();
    const { data } = await db
      .from("sessions")
      .select("*")
      .eq("session_code", sessionCode.trim().toUpperCase())
      .maybeSingle();
    return data ? mapSession(data) : null;
  },

  async createSession(input) {
    const db = await admin();
    const { data, error } = await db
      .from("sessions")
      .insert({
        workspace_id: input.workspaceId,
        created_by_user_id: input.createdByUserId,
        name: input.name,
        session_code: input.sessionCode.toUpperCase(),
        warmup_type: input.warmupType,
        framework_type: input.frameworkType,
        anonymous_cards: input.anonymousCards ?? false,
        facilitator_participates: input.facilitatorParticipates ?? true,
        grouping_permission: input.groupingPermission ?? "facilitator_only",
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapSession(data);
  },

  async updateSession(sessionId, input) {
    const db = await admin();
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.warmupType !== undefined) patch.warmup_type = input.warmupType;
    if (input.frameworkType !== undefined) patch.framework_type = input.frameworkType;
    if (input.anonymousCards !== undefined) patch.anonymous_cards = input.anonymousCards;
    if (input.facilitatorParticipates !== undefined) {
      patch.facilitator_participates = input.facilitatorParticipates;
    }
    if (input.groupingPermission !== undefined) {
      patch.grouping_permission = input.groupingPermission;
    }
    if (input.currentPhase !== undefined) patch.current_phase = input.currentPhase;
    if (input.status !== undefined) patch.status = input.status;
    if (input.startedAt !== undefined) patch.started_at = input.startedAt;
    if (input.endedAt !== undefined) patch.ended_at = input.endedAt;

    const { data, error } = await db
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapSession(data);
  },

  async advanceSessionPhase(sessionId, nextPhase) {
    return this.updateSession(sessionId, { currentPhase: nextPhase });
  },

  async startSession(sessionId) {
    return this.updateSession(sessionId, {
      status: "active",
      startedAt: new Date().toISOString(),
      currentPhase: "warmup",
    });
  },

  async completeSession(sessionId) {
    return this.updateSession(sessionId, {
      status: "completed",
      endedAt: new Date().toISOString(),
      currentPhase: "summary",
    });
  },

  async listParticipants(sessionId) {
    const db = await admin();
    const { data } = await db
      .from("session_participants")
      .select("*")
      .eq("session_id", sessionId);
    return (data ?? []).map((row) => mapParticipant(row));
  },

  async joinSession(input) {
    const db = await admin();
    const rawToken = generateSecureToken("ptok");
    const tokenHash = await hashToken(rawToken);
    const { data, error } = await db
      .from("session_participants")
      .insert({
        session_id: input.sessionId,
        display_name: input.displayName,
        participant_token_hash: tokenHash,
        user_id: input.userId ?? null,
        is_facilitator_participant: input.isFacilitatorParticipant ?? false,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapParticipant(data, rawToken);
  },

  async updateParticipantLastSeen(participantId, participantToken) {
    const db = await admin();
    const tokenHash = await hashToken(participantToken);
    const { data: row } = await db
      .from("session_participants")
      .select("*")
      .eq("id", participantId)
      .eq("participant_token_hash", tokenHash)
      .maybeSingle();
    if (!row) {
      throw new Error("Invalid participant credentials");
    }
    const { data, error } = await db
      .from("session_participants")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", participantId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapParticipant(data, participantToken);
  },

  async getSessionSnapshot(sessionId): Promise<SessionSnapshot | null> {
    const session = await this.getSessionById(sessionId);
    if (!session) {
      return null;
    }
    const [
      participants,
      warmupResponses,
      cards,
      groups,
      groupingEvents,
      votingSettings,
      votes,
      timers,
      actionSuggestions,
      actionItems,
    ] = await Promise.all([
      this.listParticipants(sessionId),
      this.listWarmupResponses(sessionId),
      this.listCards(sessionId),
      this.listGroups(sessionId),
      listGroupingEvents(sessionId),
      this.getVotingSettings(sessionId),
      this.listVotes(sessionId),
      this.listTimers(sessionId),
      this.listActionSuggestions(sessionId),
      this.listActionItemsByWorkspace(session.workspaceId),
    ]);

    return {
      session,
      participants,
      warmupResponses,
      cards,
      groups,
      groupingEvents,
      votingSettings,
      votes,
      timers,
      actionSuggestions,
      actionItems: actionItems.filter((item) => item.sourceSessionId === sessionId),
    };
  },

  async listCards(sessionId) {
    const db = await admin();
    const { data } = await db
      .from("retro_cards")
      .select("*")
      .eq("session_id", sessionId)
      .is("deleted_at", null);
    return (data ?? []).map(mapRetroCard);
  },

  async createCard(input, ctx) {
    await resolveParticipant(ctx);
    const session = await this.getSessionById(input.sessionId);
    if (!session || !isValidFrameworkColumn(session.frameworkType, input.frameworkColumn)) {
      throw new Error(`Invalid framework column: ${input.frameworkColumn}`);
    }
    const db = await admin();
    const { data, error } = await db
      .from("retro_cards")
      .insert({
        session_id: input.sessionId,
        participant_id: input.participantId,
        framework_column: input.frameworkColumn,
        text: input.text,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapRetroCard(data);
  },

  async updateCard(cardId, input, ctx) {
    const db = await admin();
    const { data: existing } = await db.from("retro_cards").select("*").eq("id", cardId).maybeSingle();
    if (!existing) {
      throw new Error("Card not found");
    }
    if ("participantToken" in ctx) {
      const participant = await resolveParticipant({ ...ctx, sessionId: existing.session_id });
      if (existing.participant_id !== participant.id) {
        throw new Error("Participants can only edit their own cards");
      }
      if (existing.is_revealed) {
        throw new Error("Revealed cards are locked");
      }
    } else if (!(await canManageSession(ctx.userId, existing.session_id))) {
      throw new Error("Not authorized to edit this card");
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.text !== undefined) patch.text = input.text;
    if (input.frameworkColumn !== undefined) patch.framework_column = input.frameworkColumn;
    if (input.groupId !== undefined) patch.group_id = input.groupId;
    if (input.isRevealed !== undefined) {
      patch.is_revealed = input.isRevealed;
      patch.revealed_at = input.revealedAt ?? (input.isRevealed ? new Date().toISOString() : null);
    }

    const { data, error } = await db.from("retro_cards").update(patch).eq("id", cardId).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapRetroCard(data);
  },

  async revealSessionCards(sessionId, ctx) {
    if ("participantToken" in ctx) {
      throw new Error("Only facilitators can reveal all cards");
    }
    if (!(await canManageSession(ctx.userId, sessionId))) {
      throw new Error("Not authorized");
    }
    const db = await admin();
    const revealedAt = new Date().toISOString();
    await db
      .from("retro_cards")
      .update({ is_revealed: true, revealed_at: revealedAt, updated_at: revealedAt })
      .eq("session_id", sessionId)
      .is("deleted_at", null);
    return this.listCards(sessionId);
  },

  async deleteCard(cardId, ctx) {
    const participant = await resolveParticipant(ctx);
    const db = await admin();
    const { data: existing } = await db.from("retro_cards").select("*").eq("id", cardId).maybeSingle();
    if (!existing || existing.participant_id !== participant.id) {
      throw new Error("Participants can only delete their own cards");
    }
    if (existing.is_revealed) {
      throw new Error("Revealed cards are locked");
    }
    const { data, error } = await db
      .from("retro_cards")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", cardId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapRetroCard(data);
  },

  async listGroups(sessionId) {
    const db = await admin();
    const { data } = await db
      .from("card_groups")
      .select("*")
      .eq("session_id", sessionId)
      .is("deleted_at", null);
    return (data ?? []).map(mapCardGroup);
  },

  async createGroup(input, actor) {
    const db = await admin();
    const actorParticipantId =
      "participantToken" in actor ? (await resolveParticipant(actor)).id : null;
    const actorUserId = "userId" in actor ? actor.userId : null;

    const { data: group, error } = await db
      .from("card_groups")
      .insert({
        session_id: input.sessionId,
        title: input.title,
        created_by_participant_id: actorParticipantId ?? input.createdByParticipantId,
        created_by_user_id: actorUserId ?? input.createdByUserId,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }

    await db.from("grouping_events").insert({
      session_id: input.sessionId,
      actor_participant_id: actorParticipantId,
      actor_user_id: actorUserId,
      event_type: "group_created",
      payload: { groupId: group.id, groupTitle: group.title },
    });

    return mapCardGroup(group);
  },

  async updateGroupTitle(groupId, title, _actor) {
    const db = await admin();
    const { data: existing } = await db.from("card_groups").select("*").eq("id", groupId).maybeSingle();
    if (!existing) {
      throw new Error("Group not found");
    }
    const previousTitle = existing.title;
    const { data, error } = await db
      .from("card_groups")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", groupId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await db.from("grouping_events").insert({
      session_id: existing.session_id,
      event_type: "group_title_updated",
      payload: { groupId, groupTitle: title, previousTitle },
    });
    return mapCardGroup(data);
  },

  async groupCards(input, actor) {
    const db = await admin();
    await db
      .from("retro_cards")
      .update({ group_id: input.groupId, updated_at: new Date().toISOString() })
      .in("id", input.cardIds);
    const actorParticipantId =
      "participantToken" in actor ? (await resolveParticipant(actor)).id : null;
    const actorUserId = "userId" in actor ? actor.userId : null;
    await db.from("grouping_events").insert({
      session_id: input.sessionId,
      actor_participant_id: actorParticipantId,
      actor_user_id: actorUserId,
      event_type: "cards_grouped",
      payload: { groupId: input.groupId, cardIds: input.cardIds },
    });
    const { data } = await db.from("card_groups").select("*").eq("id", input.groupId).single();
    return mapCardGroup(data!);
  },

  async ungroupCards(sessionId, cardIds, actor) {
    const db = await admin();
    await db
      .from("retro_cards")
      .update({ group_id: null, updated_at: new Date().toISOString() })
      .in("id", cardIds);
    const actorParticipantId =
      "participantToken" in actor ? (await resolveParticipant(actor)).id : null;
    const actorUserId = "userId" in actor ? actor.userId : null;
    await db.from("grouping_events").insert({
      session_id: sessionId,
      actor_participant_id: actorParticipantId,
      actor_user_id: actorUserId,
      event_type: "cards_ungrouped",
      payload: { cardIds },
    });
  },

  async deleteGroup(groupId, _actor) {
    const db = await admin();
    const deletedAt = new Date().toISOString();
    const { data: existing } = await db.from("card_groups").select("*").eq("id", groupId).maybeSingle();
    if (!existing) {
      throw new Error("Group not found");
    }
    await db.from("retro_cards").update({ group_id: null }).eq("group_id", groupId);
    const { data, error } = await db
      .from("card_groups")
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq("id", groupId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await db.from("grouping_events").insert({
      session_id: existing.session_id,
      event_type: "group_deleted",
      payload: { groupId },
    });
    return mapCardGroup(data);
  },

  async undoLastGroupingEvent(sessionId, ctx) {
    if (!(await canManageSession(ctx.userId, sessionId))) {
      throw new Error("Not authorized");
    }
    const db = await admin();
    const { data: event } = await db
      .from("grouping_events")
      .select("*")
      .eq("session_id", sessionId)
      .is("undone_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!event) {
      return null;
    }
    const undoneAt = new Date().toISOString();
    const payload = event.payload as { groupId?: string; cardIds?: string[]; previousTitle?: string };

    switch (event.event_type) {
      case "cards_grouped":
        if (payload.cardIds) {
          await db.from("retro_cards").update({ group_id: null }).in("id", payload.cardIds);
        }
        break;
      case "group_created":
        if (payload.groupId) {
          await db.from("card_groups").update({ deleted_at: undoneAt }).eq("id", payload.groupId);
        }
        break;
      case "group_deleted":
        if (payload.groupId) {
          await db.from("card_groups").update({ deleted_at: null }).eq("id", payload.groupId);
        }
        break;
      case "group_title_updated":
        if (payload.groupId && payload.previousTitle) {
          await db.from("card_groups").update({ title: payload.previousTitle }).eq("id", payload.groupId);
        }
        break;
      default:
        break;
    }

    await db.from("grouping_events").update({ undone_at: undoneAt }).eq("id", event.id);
    return mapGroupingEvent({ ...event, undone_at: undoneAt });
  },

  async listTimers(sessionId) {
    const db = await admin();
    const { data } = await db.from("session_timers").select("*").eq("session_id", sessionId);
    return (data ?? []).map(mapTimerState);
  },

  async upsertTimer(input, ctx) {
    if (!(await canManageSession(ctx.userId, input.sessionId))) {
      throw new Error("Not authorized");
    }
    const db = await admin();
    const { data, error } = await db
      .from("session_timers")
      .upsert(
        {
          session_id: input.sessionId,
          phase: input.phase,
          duration_seconds: input.durationSeconds,
        },
        { onConflict: "session_id,phase" },
      )
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapTimerState(data);
  },

  async startTimer(timerId, ctx) {
    if (!(await canManageSessionForTimer(timerId, ctx.userId))) {
      throw new Error("Not authorized");
    }
    return applyTimerTransition(timerId, startTimer);
  },

  async pauseTimer(timerId, ctx) {
    if (!(await canManageSessionForTimer(timerId, ctx.userId))) {
      throw new Error("Not authorized");
    }
    return applyTimerTransition(timerId, pauseTimer);
  },

  async resumeTimer(timerId, ctx) {
    if (!(await canManageSessionForTimer(timerId, ctx.userId))) {
      throw new Error("Not authorized");
    }
    return applyTimerTransition(timerId, resumeTimer);
  },

  async endTimer(timerId, ctx) {
    if (!(await canManageSessionForTimer(timerId, ctx.userId))) {
      throw new Error("Not authorized");
    }
    return applyTimerTransition(timerId, endTimer);
  },

  async getVotingSettings(sessionId) {
    const db = await admin();
    const { data } = await db.from("voting_settings").select("*").eq("session_id", sessionId).maybeSingle();
    return data ? mapVotingSettings(data) : null;
  },

  async upsertVotingSettings(sessionId, input, ctx) {
    if (!(await canManageSession(ctx.userId, sessionId))) {
      throw new Error("Not authorized");
    }
    const existing = await this.getVotingSettings(sessionId);
    const db = await admin();
    const { data, error } = await db
      .from("voting_settings")
      .upsert({
        session_id: sessionId,
        votes_per_participant: input.votesPerParticipant ?? existing?.votesPerParticipant ?? 3,
        allow_multiple_votes_per_target:
          input.allowMultipleVotesPerTarget ?? existing?.allowMultipleVotesPerTarget ?? false,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapVotingSettings(data);
  },

  async listVotes(sessionId) {
    const db = await admin();
    const { data } = await db.from("votes").select("*").eq("session_id", sessionId);
    return (data ?? []).map(mapVote);
  },

  async castVote(input, ctx) {
    await resolveParticipant(ctx);
    const settings = await this.getVotingSettings(input.sessionId);
    if (!settings) {
      throw new Error("Voting settings not configured");
    }
    const votes = await this.listVotes(input.sessionId);
    const canVote = canVoteOnTarget(settings, votes, input.participantId, {
      targetType: input.targetType,
      targetCardId: input.targetCardId,
      targetGroupId: input.targetGroupId,
    });
    if (!canVote) {
      throw new Error("Participant cannot vote on this target");
    }
    const db = await admin();
    const { data, error } = await db
      .from("votes")
      .insert({
        session_id: input.sessionId,
        participant_id: input.participantId,
        target_type: input.targetType,
        target_card_id: input.targetType === "card" ? input.targetCardId : null,
        target_group_id: input.targetType === "group" ? input.targetGroupId : null,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapVote(data);
  },

  async removeVote(voteId, ctx) {
    const participant = await resolveParticipant(ctx);
    const db = await admin();
    const { data: vote } = await db.from("votes").select("*").eq("id", voteId).maybeSingle();
    if (!vote || vote.participant_id !== participant.id) {
      throw new Error("Cannot remove this vote");
    }
    await db.from("votes").delete().eq("id", voteId);
  },

  async listWarmupResponses(sessionId) {
    const db = await admin();
    const { data } = await db.from("warmup_responses").select("*").eq("session_id", sessionId);
    return (data ?? []).map(mapWarmupResponse);
  },

  async submitWarmupResponse(input, ctx) {
    await resolveParticipant(ctx);
    const db = await admin();
    const { data, error } = await db
      .from("warmup_responses")
      .upsert(
        {
          session_id: input.sessionId,
          participant_id: input.participantId,
          warmup_type: input.warmupType,
          response: input.response,
        },
        { onConflict: "session_id,participant_id" },
      )
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapWarmupResponse(data);
  },

  async listActionItemsByWorkspace(workspaceId) {
    const db = await admin();
    const { data } = await db
      .from("action_items")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null);
    return (data ?? []).map(mapActionItem);
  },

  async listActionSuggestions(sessionId) {
    const db = await admin();
    const { data } = await db
      .from("action_suggestions")
      .select("*")
      .eq("session_id", sessionId)
      .is("deleted_at", null);
    return (data ?? []).map(mapActionSuggestion);
  },

  async createActionSuggestion(input, ctx) {
    await resolveParticipant(ctx);
    const db = await admin();
    const { data, error } = await db
      .from("action_suggestions")
      .insert({
        session_id: input.sessionId,
        participant_id: input.participantId,
        text: input.text,
        source_card_id: input.sourceCardId ?? null,
        source_group_id: input.sourceGroupId ?? null,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionSuggestion(data);
  },

  async convertSuggestionToActionItem(suggestionId, overrides, ctx) {
    const db = await admin();
    const { data: suggestion } = await db
      .from("action_suggestions")
      .select("*")
      .eq("id", suggestionId)
      .maybeSingle();
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }
    const session = await this.getSessionById(suggestion.session_id);
    if (!session || !(await canManageSession(ctx.userId, session.id))) {
      throw new Error("Not authorized");
    }
    const actionItem = await this.createActionItem(
      {
        workspaceId: session.workspaceId,
        sourceSessionId: suggestion.session_id,
        title: overrides?.title ?? suggestion.text,
        assignedToName: overrides?.assignedToName ?? "Unassigned",
        description: overrides?.description ?? null,
        sourceCardId: suggestion.source_card_id,
        sourceGroupId: suggestion.source_group_id,
        dueDate: overrides?.dueDate ?? null,
        priority: overrides?.priority ?? "medium",
        status: overrides?.status ?? "to_do",
      },
      ctx,
    );
    await db
      .from("action_suggestions")
      .update({ converted_action_item_id: actionItem.id })
      .eq("id", suggestionId);
    return actionItem;
  },

  async createActionItem(input, ctx) {
    const db = await admin();
    const { data: member } = await db
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", input.workspaceId)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!member) {
      throw new Error("Not authorized");
    }
    const { data, error } = await db
      .from("action_items")
      .insert({
        workspace_id: input.workspaceId,
        source_session_id: input.sourceSessionId,
        title: input.title,
        description: input.description ?? null,
        assigned_to_name: input.assignedToName,
        assigned_to_user_id: input.assignedToUserId ?? null,
        source_card_id: input.sourceCardId ?? null,
        source_group_id: input.sourceGroupId ?? null,
        due_date: input.dueDate ?? null,
        priority: input.priority ?? "medium",
        status: input.status ?? "to_do",
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionItem(data);
  },

  async updateActionItem(actionItemId, input, ctx) {
    const db = await admin();
    const { data: existing } = await db.from("action_items").select("*").eq("id", actionItemId).maybeSingle();
    if (!existing) {
      throw new Error("Action item not found");
    }
    const { data: member } = await db
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", existing.workspace_id)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!member) {
      throw new Error("Not authorized");
    }

    const nextStatus = input.status ?? existing.status;
    const completedAt =
      input.completedAt !== undefined
        ? input.completedAt
        : nextStatus === "done" && !existing.completed_at
          ? new Date().toISOString()
          : nextStatus !== "done"
            ? null
            : existing.completed_at;

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      completed_at: completedAt,
    };
    if (input.title !== undefined) patch.title = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.assignedToName !== undefined) patch.assigned_to_name = input.assignedToName;
    if (input.assignedToUserId !== undefined) patch.assigned_to_user_id = input.assignedToUserId;
    if (input.dueDate !== undefined) patch.due_date = input.dueDate;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.status !== undefined) patch.status = input.status;
    if (input.deletedAt !== undefined) patch.deleted_at = input.deletedAt;

    const { data, error } = await db.from("action_items").update(patch).eq("id", actionItemId).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionItem(data);
  },

  async getActionBoardShareByWorkspace(workspaceId) {
    const db = await admin();
    const { data } = await db
      .from("action_board_shares")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? mapActionBoardShare(data) : null;
  },

  async getActionBoardShareByToken(shareToken) {
    const db = await admin();
    const tokenHash = await hashToken(shareToken);
    const { data } = await db
      .from("action_board_shares")
      .select("*")
      .eq("share_token_hash", tokenHash)
      .eq("is_active", true)
      .is("revoked_at", null)
      .maybeSingle();
    return data ? mapActionBoardShare(data, shareToken) : null;
  },

  async createActionBoardShare(workspaceId, ctx) {
    const db = await admin();
    const { data: member } = await db
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!member) {
      throw new Error("Not authorized");
    }
    const rawToken = generateSecureToken("share");
    const tokenHash = await hashToken(rawToken);
    const { data, error } = await db
      .from("action_board_shares")
      .insert({
        workspace_id: workspaceId,
        share_token_hash: tokenHash,
        is_active: true,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionBoardShare(data, rawToken);
  },

  async regenerateActionBoardShare(shareId, ctx) {
    const db = await admin();
    const { data: existing } = await db.from("action_board_shares").select("*").eq("id", shareId).maybeSingle();
    if (!existing) {
      throw new Error("Share not found");
    }
    const { data: member } = await db
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", existing.workspace_id)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!member) {
      throw new Error("Not authorized");
    }
    const rawToken = generateSecureToken("share");
    const tokenHash = await hashToken(rawToken);
    const { data, error } = await db
      .from("action_board_shares")
      .update({
        share_token_hash: tokenHash,
        regenerated_at: new Date().toISOString(),
        is_active: true,
        revoked_at: null,
      })
      .eq("id", shareId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionBoardShare(data, rawToken);
  },

  async revokeActionBoardShare(shareId, ctx) {
    const db = await admin();
    const { data: existing } = await db.from("action_board_shares").select("*").eq("id", shareId).maybeSingle();
    if (!existing) {
      throw new Error("Share not found");
    }
    const { data: member } = await db
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", existing.workspace_id)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!member) {
      throw new Error("Not authorized");
    }
    const { data, error } = await db
      .from("action_board_shares")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", shareId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapActionBoardShare(data);
  },
};
