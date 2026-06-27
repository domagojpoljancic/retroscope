import type {
  FrameworkType,
  GroupingPermission,
  SessionPhase,
  SessionStatus,
  WarmupType,
} from "@/types/enums";

export interface Session {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  name: string;
  sessionCode: string;
  warmupType: WarmupType;
  frameworkType: FrameworkType;
  anonymousCards: boolean;
  facilitatorParticipates: boolean;
  groupingPermission: GroupingPermission;
  currentPhase: SessionPhase;
  status: SessionStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}
