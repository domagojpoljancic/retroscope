import type {
  ActionItemPriority,
  ActionItemStatus,
  FrameworkType,
  GroupingPermission,
  WarmupType,
} from "@/types";

export const WARMUP_LABELS: Record<WarmupType, string> = {
  mood_character: "Mood Character Builder",
  this_or_that: "This or That",
  guessing_game: "Guessing Game",
};

export const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  start_stop_continue: "Start / Stop / Continue",
  mad_sad_glad: "Mad / Sad / Glad",
  sailboat: "Sailboat",
};

export const GROUPING_PERMISSION_LABELS: Record<GroupingPermission, string> = {
  facilitator_only: "Facilitator only",
  participants_allowed: "Participants can group",
};

export const PRIORITY_LABELS: Record<ActionItemPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABELS: Record<ActionItemStatus, string> = {
  to_do: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const WARMUP_OPTIONS: WarmupType[] = [
  "mood_character",
  "this_or_that",
  "guessing_game",
];

export const FRAMEWORK_OPTIONS: FrameworkType[] = [
  "start_stop_continue",
  "mad_sad_glad",
  "sailboat",
];

export const PRIORITY_OPTIONS: ActionItemPriority[] = ["low", "medium", "high"];

export const STATUS_OPTIONS: ActionItemStatus[] = [
  "to_do",
  "in_progress",
  "done",
];
