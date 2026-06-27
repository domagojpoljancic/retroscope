import { getPhaseDefinition } from "@/lib/phases";
import type { SessionPhase } from "@/types";

/**
 * "Current mission" copy for each phase. This is the single source of truth for
 * the guided, first-time-friendly framing shown at the top of every phase:
 *  - what the phase is about (title + blurb)
 *  - what participants can do right now
 *  - what the facilitator should do next
 *
 * Keep these short. The phase content and command bar carry the detail.
 */
export interface PhaseMission {
  /** Short, action-oriented phase title. */
  title: string;
  /** One-sentence explanation of what is happening now. */
  blurb: string;
  /** What participants can do during this phase. */
  participants: string;
  /** What the facilitator should do next. */
  facilitator: string;
}

export const PHASE_MISSIONS: Record<SessionPhase, PhaseMission> = {
  lobby: {
    title: "Set up the room",
    blurb:
      "Invite the team and review your retro settings before you begin.",
    participants: "Join with the code and wait for the warm-up to start.",
    facilitator: "Share the invite, then start the warm-up.",
  },
  warmup: {
    title: "Warm up the room",
    blurb:
      "A quick, low-stakes activity to help everyone arrive before the real work starts.",
    participants: "Join in — there are no wrong answers.",
    facilitator: "Run the activity, then continue when energy is up.",
  },
  previous_action_review: {
    title: "Review last retro's actions",
    blurb:
      "Check in on the commitments from last time before looking ahead.",
    participants: "Follow along and weigh in on progress.",
    facilitator: "Update statuses, then continue to writing.",
  },
  writing_setup: {
    title: "Set the writing timer",
    blurb: "Choose how long the team has to add cards privately.",
    participants: "Get ready — writing starts when the timer does.",
    facilitator: "Pick a duration, then start writing.",
  },
  writing: {
    title: "Write privately",
    blurb:
      "Add cards to the board. Others can see that cards exist, but the text stays hidden until reveal.",
    participants: "Add cards, and reveal your own when ready.",
    facilitator: "Give the team time, then end writing to move to reveal.",
  },
  reveal_group: {
    title: "Reveal and organize themes",
    blurb: "Reveal cards, then group similar ideas into themes before voting.",
    participants: "Read along — grouping may be facilitator-led.",
    facilitator: "Reveal cards, build themes, then continue to voting.",
  },
  voting_setup: {
    title: "Set up voting",
    blurb:
      "Decide how many votes each person gets and how long voting runs.",
    participants: "Get ready to spend your votes.",
    facilitator: "Confirm the settings, then start voting.",
  },
  voting: {
    title: "Vote on what matters",
    blurb:
      "Use your votes on the themes and cards worth discussing. You can move votes while voting is open.",
    participants: "Spend your votes on what matters most.",
    facilitator: "Watch the votes land, then end voting.",
  },
  discussion: {
    title: "Discuss and decide actions",
    blurb:
      "Start with the highest-voted themes and turn decisions into owned action items.",
    participants: "Suggest actions on the topics that matter.",
    facilitator: "Capture 1–3 action items, then finish the retro.",
  },
  summary: {
    title: "Wrap up and follow through",
    blurb:
      "Review what the team decided and carry the action items beyond the meeting.",
    participants: "Review the outcomes and your action items.",
    facilitator: "Share the summary and the action board.",
  },
};

export function getPhaseMission(phase: SessionPhase): PhaseMission {
  return PHASE_MISSIONS[phase];
}

/** Mono metadata tag, e.g. "PHASE 04 · WRITING". */
export function getPhaseTag(phase: SessionPhase): string {
  const def = getPhaseDefinition(phase);
  const order = String(def.order).padStart(2, "0");
  return `PHASE ${order} · ${def.label.toUpperCase()}`;
}
