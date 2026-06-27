import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { SessionCreateForm } from "@/components/session-create/session-create-form";

export const metadata: Metadata = {
  title: "New Retro",
};

export default function NewSessionPage() {
  return (
    <PageContainer>
      <SessionCreateForm />
    </PageContainer>
  );
}
