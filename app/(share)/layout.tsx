import { AppShell } from "@/components/layout/app-shell";

export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell hideHeader>{children}</AppShell>;
}
