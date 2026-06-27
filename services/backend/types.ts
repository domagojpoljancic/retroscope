import type { MockDataState } from "@/mock";
import type {
  CreateActionItemInput,
  CreateActionSuggestionInput,
  UpdateActionItemInput,
} from "@/services/actionService";
import type { CreateCardInput, UpdateCardInput } from "@/services/cardService";
import type {
  CreateGroupInput,
  GroupCardsInput,
} from "@/services/groupService";
import type { JoinSessionInput } from "@/services/participantService";
import type {
  CreateSessionInput,
  UpdateSessionInput,
} from "@/services/sessionService";
import type { CreateTimerInput } from "@/services/timerService";
import type {
  CastVoteInput,
  UpdateVotingSettingsInput,
} from "@/services/voteService";
import type { SubmitWarmupResponseInput } from "@/services/warmupService";
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
  SessionPhase,
  TimerState,
  Vote,
  VotingSettings,
  WarmupResponse,
  Workspace,
  WorkspaceMember,
} from "@/types";

export interface SessionSnapshot {
  session: Session;
  participants: Participant[];
  warmupResponses: WarmupResponse[];
  cards: RetroCard[];
  groups: CardGroup[];
  groupingEvents: GroupingEvent[];
  votingSettings: VotingSettings | null;
  votes: Vote[];
  timers: TimerState[];
  actionSuggestions: ActionSuggestion[];
  actionItems: ActionItem[];
}

export interface AuthContext {
  userId: string;
  profile: Profile;
  workspace: Workspace;
  workspaceMember: WorkspaceMember;
}

export interface ParticipantContext {
  participantId: string;
  participantToken: string;
  sessionId: string;
}

export interface BackendClient {
  readonly mode: "mock" | "supabase";

  // Auth
  getAuthContext(): Promise<AuthContext | null>;
  signUp(email: string, password: string, displayName: string): Promise<AuthContext>;
  signIn(email: string, password: string): Promise<AuthContext>;
  signOut(): Promise<void>;

  // Workspace / profile
  getProfile(userId: string): Promise<Profile | null>;
  ensureAuthBootstrap(userId: string, email: string, displayName: string): Promise<AuthContext>;

  // Sessions
  listSessionsByWorkspace(workspaceId: string): Promise<Session[]>;
  getSessionById(sessionId: string): Promise<Session | null>;
  getSessionByCode(sessionCode: string): Promise<Session | null>;
  createSession(input: CreateSessionInput): Promise<Session>;
  updateSession(sessionId: string, input: UpdateSessionInput): Promise<Session>;
  advanceSessionPhase(sessionId: string, nextPhase: SessionPhase): Promise<Session>;
  startSession(sessionId: string): Promise<Session>;
  completeSession(sessionId: string): Promise<Session>;

  // Participants
  listParticipants(sessionId: string): Promise<Participant[]>;
  joinSession(input: JoinSessionInput): Promise<Participant>;
  updateParticipantLastSeen(participantId: string, participantToken: string): Promise<Participant>;

  // Session snapshot (for live room)
  getSessionSnapshot(sessionId: string): Promise<SessionSnapshot | null>;

  // Cards
  listCards(sessionId: string): Promise<RetroCard[]>;
  createCard(input: CreateCardInput, ctx: ParticipantContext): Promise<RetroCard>;
  updateCard(
    cardId: string,
    input: UpdateCardInput,
    ctx: ParticipantContext | { userId: string; isFacilitator: true },
  ): Promise<RetroCard>;
  revealSessionCards(sessionId: string, ctx: { userId: string } | ParticipantContext): Promise<RetroCard[]>;
  deleteCard(cardId: string, ctx: ParticipantContext): Promise<RetroCard>;

  // Groups
  listGroups(sessionId: string): Promise<CardGroup[]>;
  createGroup(input: CreateGroupInput, actor: ParticipantContext | { userId: string }): Promise<CardGroup>;
  updateGroupTitle(groupId: string, title: string, actor: ParticipantContext | { userId: string }): Promise<CardGroup>;
  groupCards(input: GroupCardsInput, actor: ParticipantContext | { userId: string }): Promise<CardGroup>;
  ungroupCards(
    sessionId: string,
    cardIds: string[],
    actor: ParticipantContext | { userId: string },
  ): Promise<void>;
  deleteGroup(groupId: string, actor: ParticipantContext | { userId: string }): Promise<CardGroup>;
  undoLastGroupingEvent(sessionId: string, actor: { userId: string }): Promise<GroupingEvent | null>;

  // Timers
  listTimers(sessionId: string): Promise<TimerState[]>;
  upsertTimer(input: CreateTimerInput, ctx: { userId: string }): Promise<TimerState>;
  startTimer(timerId: string, ctx: { userId: string }): Promise<TimerState>;
  pauseTimer(timerId: string, ctx: { userId: string }): Promise<TimerState>;
  resumeTimer(timerId: string, ctx: { userId: string }): Promise<TimerState>;
  endTimer(timerId: string, ctx: { userId: string }): Promise<TimerState>;

  // Voting
  getVotingSettings(sessionId: string): Promise<VotingSettings | null>;
  upsertVotingSettings(sessionId: string, input: UpdateVotingSettingsInput, ctx: { userId: string }): Promise<VotingSettings>;
  listVotes(sessionId: string): Promise<Vote[]>;
  castVote(input: CastVoteInput, ctx: ParticipantContext): Promise<Vote>;
  removeVote(voteId: string, ctx: ParticipantContext): Promise<void>;

  // Warmup
  listWarmupResponses(sessionId: string): Promise<WarmupResponse[]>;
  submitWarmupResponse(input: SubmitWarmupResponseInput, ctx: ParticipantContext): Promise<WarmupResponse>;

  // Actions
  listActionItemsByWorkspace(workspaceId: string): Promise<ActionItem[]>;
  listActionSuggestions(sessionId: string): Promise<ActionSuggestion[]>;
  createActionSuggestion(input: CreateActionSuggestionInput, ctx: ParticipantContext): Promise<ActionSuggestion>;
  convertSuggestionToActionItem(
    suggestionId: string,
    overrides: Partial<CreateActionItemInput> | undefined,
    ctx: { userId: string },
  ): Promise<ActionItem>;
  createActionItem(input: CreateActionItemInput, ctx: { userId: string }): Promise<ActionItem>;
  updateActionItem(actionItemId: string, input: UpdateActionItemInput, ctx: { userId: string }): Promise<ActionItem>;

  // Action board share
  getActionBoardShareByWorkspace(workspaceId: string): Promise<ActionBoardShare | null>;
  getActionBoardShareByToken(shareToken: string): Promise<ActionBoardShare | null>;
  createActionBoardShare(workspaceId: string, ctx: { userId: string }): Promise<ActionBoardShare>;
  regenerateActionBoardShare(shareId: string, ctx: { userId: string }): Promise<ActionBoardShare>;
  revokeActionBoardShare(shareId: string, ctx: { userId: string }): Promise<ActionBoardShare>;

  // Mock-only: full store snapshot for prototype UI
  getMockStore?(): MockDataState;
}
