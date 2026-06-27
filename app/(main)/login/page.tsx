import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <PageContainer size="narrow">
      <LoginForm />
    </PageContainer>
  );
}
