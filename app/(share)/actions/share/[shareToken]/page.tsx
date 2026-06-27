import type { Metadata } from "next";

import { SharedActionBoard } from "@/components/action-board/shared-action-board";
import { PageContainer } from "@/components/layout/page-container";

type SharedActionsPageProps = {
  params: Promise<{ shareToken: string }>;
};

export async function generateMetadata({
  params,
}: SharedActionsPageProps): Promise<Metadata> {
  const { shareToken } = await params;

  return {
    title: `Shared Actions · ${shareToken}`,
  };
}

export default async function SharedActionsPage({
  params,
}: SharedActionsPageProps) {
  const { shareToken } = await params;

  return (
    <PageContainer size="wide">
      <SharedActionBoard shareToken={shareToken} />
    </PageContainer>
  );
}
