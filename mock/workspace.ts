import { daysAgo } from "@/lib/dates";
import type { Workspace, WorkspaceMember } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

export const mockWorkspace: Workspace = {
  id: MOCK_IDS.workspace,
  name: "Product Platform Team",
  createdAt: daysAgo(365),
};

export const mockWorkspaceMembers: WorkspaceMember[] = [
  {
    id: "wm-alex",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.alex,
    role: "owner",
    joinedAt: daysAgo(365),
  },
  {
    id: "wm-marta",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.marta,
    role: "facilitator",
    joinedAt: daysAgo(300),
  },
  {
    id: "wm-jamie",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.jamie,
    role: "participant",
    joinedAt: daysAgo(200),
  },
  {
    id: "wm-priya",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.priya,
    role: "participant",
    joinedAt: daysAgo(180),
  },
  {
    id: "wm-tom",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.tom,
    role: "participant",
    joinedAt: daysAgo(150),
  },
  {
    id: "wm-sara",
    workspaceId: MOCK_IDS.workspace,
    userId: MOCK_IDS.users.sara,
    role: "participant",
    joinedAt: daysAgo(120),
  },
];
