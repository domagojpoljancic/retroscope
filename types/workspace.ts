import type { WorkspaceMemberRole } from "@/types/enums";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
}
