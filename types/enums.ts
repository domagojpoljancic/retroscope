export type WorkspaceMemberRole = "owner" | "facilitator" | "participant";

export type SessionPhase =
  | "lobby"
  | "warmup"
  | "previous_action_review"
  | "writing_setup"
  | "writing"
  | "reveal_group"
  | "voting_setup"
  | "voting"
  | "discussion"
  | "summary";

export type SessionStatus = "draft" | "active" | "completed" | "archived";

export type WarmupType = "mood_character" | "this_or_that" | "guessing_game";

export type FrameworkType = "start_stop_continue" | "mad_sad_glad" | "sailboat";

export type GroupingPermission = "facilitator_only" | "participants_allowed";

export type TimerPhase = "writing" | "voting";

export type TimerStatus = "not_started" | "running" | "paused" | "ended";

export type VoteTargetType = "card" | "group";

export type ActionItemPriority = "low" | "medium" | "high";

export type ActionItemStatus = "to_do" | "in_progress" | "done";

export type GroupingEventType =
  | "group_created"
  | "group_deleted"
  | "group_title_updated"
  | "cards_grouped"
  | "cards_ungrouped"
  | "group_merged";
