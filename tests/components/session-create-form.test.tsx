import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionCreateForm } from "@/components/session-create/session-create-form";
import { ToastProvider } from "@/components/ui/toast";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));
// Avoid pulling the server-action / Supabase graph into the test.
vi.mock("@/lib/api", () => ({ api: { createSession: vi.fn(), joinSession: vi.fn() } }));
vi.mock("@/app/actions/auth", () => ({ getAuthContextAction: vi.fn() }));

function renderForm() {
  return render(
    <ToastProvider>
      <SessionCreateForm />
    </ToastProvider>,
  );
}

describe("SessionCreateForm validation", () => {
  it("blocks submission and shows an error when the name is empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /create session/i }));

    expect(screen.getByText("Session name is required.")).toBeInTheDocument();
  });

  it("clears the error once the user types a name", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /create session/i }));
    expect(screen.getByText("Session name is required.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Session name"), "Sprint 26 Retro");
    expect(screen.queryByText("Session name is required.")).not.toBeInTheDocument();
  });
});
