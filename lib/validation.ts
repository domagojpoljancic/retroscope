import type {
  ActionItemPriority,
  ActionItemStatus,
  FrameworkType,
  GroupingPermission,
  WarmupType,
} from "@/types";

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export const PERMISSION_MESSAGES = {
  facilitatorOnlyGrouping:
    "Only the facilitator can group cards in this session.",
  editOwnUnrevealed: "You can only edit your own unrevealed cards.",
  votingEnded: "Voting has ended.",
  readOnlyBoard: "This board is read-only.",
} as const;

function required(value: string, label: string): ValidationResult {
  if (!value.trim()) {
    return { ok: false, error: `${label} is required.` };
  }
  return { ok: true };
}

export function validateDisplayName(name: string): ValidationResult {
  return required(name, "Display name");
}

export function validateSessionName(name: string): ValidationResult {
  return required(name, "Session name");
}

export function validateWarmupType(value: WarmupType | ""): ValidationResult {
  if (!value) {
    return { ok: false, error: "Select a warm-up activity." };
  }
  return { ok: true };
}

export function validateFrameworkType(
  value: FrameworkType | "",
): ValidationResult {
  if (!value) {
    return { ok: false, error: "Select a retro framework." };
  }
  return { ok: true };
}

export function validateGroupingPermission(
  value: GroupingPermission | "",
): ValidationResult {
  if (!value) {
    return { ok: false, error: "Select who can group cards." };
  }
  return { ok: true };
}

export function validateCardText(text: string): ValidationResult {
  return required(text, "Card text");
}

export function validateGroupTitle(title: string): ValidationResult {
  return required(title, "Theme title");
}

export function validateVotesPerParticipant(votes: number): ValidationResult {
  if (!Number.isFinite(votes) || votes <= 0) {
    return { ok: false, error: "Votes per participant must be greater than 0." };
  }
  return { ok: true };
}

export function validateTimerDuration(seconds: number): ValidationResult {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return { ok: false, error: "Timer duration must be greater than 0." };
  }
  return { ok: true };
}

export function validateDueDate(value: string): ValidationResult {
  if (!value.trim()) {
    return { ok: true };
  }
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "Enter a valid due date." };
  }
  return { ok: true };
}

export function validateActionItemTitle(title: string): ValidationResult {
  return required(title, "Title");
}

export function validateActionItemOwner(
  owner: string,
  requireOwner = false,
): ValidationResult {
  if (requireOwner && !owner.trim()) {
    return { ok: false, error: "Owner is required." };
  }
  return { ok: true };
}

export function validateActionItemPriority(
  priority: ActionItemPriority | "",
): ValidationResult {
  if (!priority) {
    return { ok: false, error: "Priority is required." };
  }
  return { ok: true };
}

export function validateActionItemStatus(
  status: ActionItemStatus | "",
): ValidationResult {
  if (!status) {
    return { ok: false, error: "Status is required." };
  }
  return { ok: true };
}

export function validateActionSuggestion(text: string): ValidationResult {
  return required(text, "Suggestion");
}

export type ActionItemFormInput = {
  title: string;
  assignedToName: string;
  dueDate: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
};

export function validateActionItemForm(
  values: ActionItemFormInput,
  options?: { requireOwner?: boolean },
): ValidationResult {
  const title = validateActionItemTitle(values.title);
  if (!title.ok) {
    return title;
  }
  const owner = validateActionItemOwner(
    values.assignedToName,
    options?.requireOwner ?? false,
  );
  if (!owner.ok) {
    return owner;
  }
  const priority = validateActionItemPriority(values.priority);
  if (!priority.ok) {
    return priority;
  }
  const status = validateActionItemStatus(values.status);
  if (!status.ok) {
    return status;
  }
  return validateDueDate(values.dueDate);
}

export type SessionCreateInput = {
  name: string;
  warmupType: WarmupType;
  frameworkType: FrameworkType;
  groupingPermission: GroupingPermission;
};

export function validateSessionCreate(
  input: SessionCreateInput,
): ValidationResult {
  const checks = [
    validateSessionName(input.name),
    validateWarmupType(input.warmupType),
    validateFrameworkType(input.frameworkType),
    validateGroupingPermission(input.groupingPermission),
  ];
  return checks.find((check) => !check.ok) ?? { ok: true };
}
