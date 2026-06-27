import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JoinForm } from "@/components/join/join-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/api", () => ({
  api: {
    // Inlined session (vi.mock is hoisted above imports, so factory helpers
    // cannot be referenced here).
    getSessionByCode: vi.fn().mockResolvedValue({
      id: "session-1",
      workspaceId: "workspace-1",
      createdByUserId: "user-1",
      name: "Sprint 25 Retro",
      sessionCode: "ABCDEF",
      warmupType: "mood_character",
      frameworkType: "start_stop_continue",
      anonymousCards: true,
      facilitatorParticipates: true,
      groupingPermission: "facilitator_only",
      currentPhase: "lobby",
      status: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
      startedAt: null,
      endedAt: null,
    }),
    joinSession: vi.fn(),
  },
}));
vi.mock("@/lib/use-session-data", () => ({
  useSessionData: () => null,
}));

describe("JoinForm validation", () => {
  it("shows a not-found state for an invalid session code", () => {
    render(<JoinForm sessionCode="!!" />);
    expect(screen.getByText("Session not found")).toBeInTheDocument();
  });

  it("requires a display name before joining", async () => {
    const user = userEvent.setup();
    render(<JoinForm sessionCode="ABCDEF" />);

    // Wait for the async session lookup to resolve into the join form.
    const joinButton = await screen.findByRole("button", { name: /join session/i });
    await user.click(joinButton);

    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
  });
});
