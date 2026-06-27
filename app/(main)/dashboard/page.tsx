import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PageContainer size="wide">
      <DashboardView />
    </PageContainer>
  );
}
