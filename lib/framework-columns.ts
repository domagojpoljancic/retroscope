import type { FrameworkType } from "@/types/enums";

export interface FrameworkColumnDefinition {
  id: string;
  label: string;
  description: string;
  accentColor: string;
}

const START_STOP_CONTINUE_COLUMNS: FrameworkColumnDefinition[] = [
  {
    id: "start",
    label: "Start",
    description: "Things we should begin doing",
    accentColor: "#22c55e",
  },
  {
    id: "stop",
    label: "Stop",
    description: "Things we should stop doing",
    accentColor: "#ef4444",
  },
  {
    id: "continue",
    label: "Continue",
    description: "Things that are working well",
    accentColor: "#3b82f6",
  },
];

const MAD_SAD_GLAD_COLUMNS: FrameworkColumnDefinition[] = [
  {
    id: "mad",
    label: "Mad",
    description: "Frustrations and blockers",
    accentColor: "#ef4444",
  },
  {
    id: "sad",
    label: "Sad",
    description: "Disappointments and misses",
    accentColor: "#8b5cf6",
  },
  {
    id: "glad",
    label: "Glad",
    description: "Wins and positives",
    accentColor: "#22c55e",
  },
];

const SAILBOAT_COLUMNS: FrameworkColumnDefinition[] = [
  {
    id: "wind",
    label: "Wind",
    description: "What is pushing us forward",
    accentColor: "#38bdf8",
  },
  {
    id: "anchor",
    label: "Anchor",
    description: "What is holding us back",
    accentColor: "#64748b",
  },
  {
    id: "rocks",
    label: "Rocks",
    description: "Risks ahead",
    accentColor: "#f97316",
  },
  {
    id: "island",
    label: "Island",
    description: "Our goals and vision",
    accentColor: "#22c55e",
  },
];

const FRAMEWORK_COLUMNS: Record<FrameworkType, FrameworkColumnDefinition[]> = {
  start_stop_continue: START_STOP_CONTINUE_COLUMNS,
  mad_sad_glad: MAD_SAD_GLAD_COLUMNS,
  sailboat: SAILBOAT_COLUMNS,
};

export function getFrameworkColumns(
  frameworkType: FrameworkType,
): FrameworkColumnDefinition[] {
  return FRAMEWORK_COLUMNS[frameworkType];
}

export function getFrameworkColumn(
  frameworkType: FrameworkType,
  columnId: string,
): FrameworkColumnDefinition | undefined {
  return getFrameworkColumns(frameworkType).find((column) => column.id === columnId);
}

export function isValidFrameworkColumn(
  frameworkType: FrameworkType,
  columnId: string,
): boolean {
  return getFrameworkColumns(frameworkType).some((column) => column.id === columnId);
}
