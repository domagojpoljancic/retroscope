import type { SessionPhase } from "@/types/enums";

export interface PhaseDefinition {
  id: SessionPhase;
  label: string;
  description: string;
  order: number;
}

export const SESSION_PHASES: PhaseDefinition[] = [
  {
    id: "lobby",
    label: "Lobby",
    description: "Participants join and the facilitator prepares the session",
    order: 0,
  },
  {
    id: "warmup",
    label: "Warm-up",
    description: "Light activity to help the team settle in",
    order: 1,
  },
  {
    id: "previous_action_review",
    label: "Previous Actions",
    description: "Review open action items from earlier retros",
    order: 2,
  },
  {
    id: "writing_setup",
    label: "Writing Setup",
    description: "Configure the writing phase before cards are added",
    order: 3,
  },
  {
    id: "writing",
    label: "Writing",
    description: "Participants add cards privately",
    order: 4,
  },
  {
    id: "reveal_group",
    label: "Reveal & Group",
    description: "Reveal cards and organize them into themes",
    order: 5,
  },
  {
    id: "voting_setup",
    label: "Voting Setup",
    description: "Configure how voting will work",
    order: 6,
  },
  {
    id: "voting",
    label: "Voting",
    description: "Participants vote on the most important topics",
    order: 7,
  },
  {
    id: "discussion",
    label: "Discussion",
    description: "Discuss top-voted topics and capture insights",
    order: 8,
  },
  {
    id: "summary",
    label: "Summary",
    description: "Review outcomes and finalize action items",
    order: 9,
  },
];

export function getPhaseDefinition(phase: SessionPhase): PhaseDefinition {
  const definition = SESSION_PHASES.find((item) => item.id === phase);
  if (!definition) {
    throw new Error(`Unknown session phase: ${phase}`);
  }
  return definition;
}

export function getNextPhase(phase: SessionPhase): SessionPhase | null {
  const current = getPhaseDefinition(phase);
  const next = SESSION_PHASES.find((item) => item.order === current.order + 1);
  return next?.id ?? null;
}

export function getPreviousPhase(phase: SessionPhase): SessionPhase | null {
  const current = getPhaseDefinition(phase);
  const previous = SESSION_PHASES.find((item) => item.order === current.order - 1);
  return previous?.id ?? null;
}

export function isPhaseAtOrAfter(
  current: SessionPhase,
  target: SessionPhase,
): boolean {
  return getPhaseDefinition(current).order >= getPhaseDefinition(target).order;
}
