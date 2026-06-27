import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SummaryView } from "@/components/summary/summary-view";

type SessionSummaryPageProps = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({
  params,
}: SessionSummaryPageProps): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `Summary · ${sessionId}`,
  };
}

export default async function SessionSummaryPage({
  params,
}: SessionSummaryPageProps) {
  const { sessionId } = await params;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Session wrap-up"
        title="Retro summary"
        description="Outcomes, top topics, and owned follow-ups from the session."
      />
      <SummaryView sessionId={sessionId} />
    </PageContainer>
  );
}
