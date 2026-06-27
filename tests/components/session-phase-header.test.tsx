import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { SessionTopBar } from "@/components/session-room/top-bar";
import { renderInRoom } from "../helpers/room";
import { makeParticipant } from "../factories";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("SessionTopBar phase header", () => {
  it("displays the current phase label and session name", () => {
    renderInRoom(<SessionTopBar />, {
      session: { currentPhase: "voting", name: "Sprint 25 Retro" },
    });
    expect(screen.getByText("Voting")).toBeInTheDocument();
    expect(screen.getByText("Sprint 25 Retro")).toBeInTheDocument();
  });

  it("updates the label when the phase changes", () => {
    renderInRoom(<SessionTopBar />, { session: { currentPhase: "writing" } });
    expect(screen.getByText("Writing")).toBeInTheDocument();
  });

  it("shows the participant count", () => {
    renderInRoom(<SessionTopBar />, {
      session: { currentPhase: "lobby" },
      participants: [
        makeParticipant({ id: "p1" }),
        makeParticipant({ id: "p2" }),
      ],
    });
    expect(screen.getByText("Lobby")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
