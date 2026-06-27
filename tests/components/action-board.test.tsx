import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ActionBoard } from "@/components/actions/action-board";
import { ToastProvider } from "@/components/ui/toast";
import { makeActionItem } from "../factories";

vi.mock("@/lib/api", () => ({ api: {} }));

const items = [
  makeActionItem({
    id: "a1",
    title: "Improve deploy pipeline",
    assignedToName: "Alex",
    status: "to_do",
  }),
  makeActionItem({
    id: "a2",
    title: "Document on-call rotation",
    assignedToName: "Sam",
    status: "in_progress",
  }),
];

const store = {
  actionItems: items,
  sessions: [{ id: "session-1", name: "Sprint 25 Retro" }],
};

vi.mock("@/lib/use-session-data", () => ({
  useAppStore: () => store,
}));

function renderBoard(readOnly = false) {
  return render(
    <ToastProvider>
      <ActionBoard workspaceId="workspace-1" readOnly={readOnly} />
    </ToastProvider>,
  );
}

describe("ActionBoard filtering", () => {
  it("renders all action items by default", () => {
    renderBoard();
    expect(screen.getByText("Improve deploy pipeline")).toBeInTheDocument();
    expect(screen.getByText("Document on-call rotation")).toBeInTheDocument();
  });

  it("filters items by the search query", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.type(screen.getByPlaceholderText("Search actions…"), "deploy");

    expect(screen.getByText("Improve deploy pipeline")).toBeInTheDocument();
    expect(
      screen.queryByText("Document on-call rotation"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty-filter message when nothing matches", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.type(
      screen.getByPlaceholderText("Search actions…"),
      "nonexistent-term",
    );

    expect(
      screen.getByText(/No action items match your filters/i),
    ).toBeInTheDocument();
  });
});

describe("ActionBoard read-only mode", () => {
  it("hides edit controls and shows the read-only banner", () => {
    renderBoard(true);

    expect(
      screen.queryByRole("button", { name: /new action item/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /share board/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });

  it("exposes create controls when editable", () => {
    renderBoard(false);
    expect(
      screen.getByRole("button", { name: /new action item/i }),
    ).toBeInTheDocument();
  });
});
