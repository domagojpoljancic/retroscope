import { getNextPhase, getPreviousPhase } from "@/lib/phases";
import type { SessionPhase } from "@/types";

/**
 * Returns the next phase, skipping the previous-action-review phase when there
 * are no active action items to review.
 */
export function getNextPhaseInFlow(
  phase: SessionPhase,
  hasActionReview: boolean,
): SessionPhase | null {
  let next = getNextPhase(phase);
  if (next === "previous_action_review" && !hasActionReview) {
    next = getNextPhase("previous_action_review");
  }
  return next;
}

export function getPreviousPhaseInFlow(
  phase: SessionPhase,
  hasActionReview: boolean,
): SessionPhase | null {
  let previous = getPreviousPhase(phase);
  if (previous === "previous_action_review" && !hasActionReview) {
    previous = getPreviousPhase("previous_action_review");
  }
  return previous;
}

/** Suggested votes-per-participant based on the number of votable targets. */
export function suggestVotesPerParticipant(targetCount: number): number {
  if (targetCount <= 0) {
    return 3;
  }
  // Roughly a third of the targets, clamped to a sensible range.
  return Math.min(Math.max(Math.round(targetCount / 3), 3), 6);
}

/** Suggested voting timer (seconds) based on the number of votable targets. */
export function suggestVotingSeconds(targetCount: number): number {
  if (targetCount <= 4) {
    return 120;
  }
  if (targetCount <= 8) {
    return 180;
  }
  return 300;
}
