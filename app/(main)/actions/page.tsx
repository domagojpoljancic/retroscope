import type { Metadata } from "next";

import { ActionBoard } from "@/components/actions/action-board";
import { PageContainer } from "@/components/layout/page-container";
import { MOCK_IDS } from "@/mock/ids";

export const metadata: Metadata = {
  title: "Action Items",
};

export default function ActionsPage() {
  return (
    <PageContainer size="wide">
      <ActionBoard workspaceId={MOCK_IDS.workspace} />
    </PageContainer>
  );
}
