import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { SessionRoom } from "@/components/session-room/session-room";

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `Session ${sessionId}`,
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <PageContainer size="wide">
      <SessionRoom sessionId={sessionId} />
    </PageContainer>
  );
}
