import type { Metadata } from "next";

import { JoinForm } from "@/components/join/join-form";
import { PageContainer } from "@/components/layout/page-container";

type JoinPageProps = {
  params: Promise<{ sessionCode: string }>;
};

export async function generateMetadata({
  params,
}: JoinPageProps): Promise<Metadata> {
  const { sessionCode } = await params;

  return {
    title: `Join ${sessionCode.toUpperCase()}`,
  };
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { sessionCode } = await params;

  return (
    <PageContainer size="narrow">
      <JoinForm sessionCode={sessionCode} />
    </PageContainer>
  );
}
