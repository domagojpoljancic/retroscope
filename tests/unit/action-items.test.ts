import { describe, expect, it } from "vitest";

import {
  filterActionItemsByStatus,
  getOpenActionItemsForReview,
  isActionItemActive,
  isActionItemOpen,
  sortActionItemsByPriority,
} from "@/lib/action-items";
import { makeActionItem } from "../factories";

describe("isActionItemOpen", () => {
  it("is open for to_do and in_progress items", () => {
    expect(isActionItemOpen(makeActionItem({ status: "to_do" }))).toBe(true);
    expect(isActionItemOpen(makeActionItem({ status: "in_progress" }))).toBe(true);
  });

  it("is not open when done or deleted", () => {
    expect(isActionItemOpen(makeActionItem({ status: "done" }))).toBe(false);
    expect(
      isActionItemOpen(makeActionItem({ deletedAt: "2024-02-01T00:00:00.000Z" })),
    ).toBe(false);
  });
});

describe("isActionItemActive (previous action review)", () => {
  it("treats undeleted to_do / in_progress items as active", () => {
    expect(isActionItemActive(makeActionItem({ status: "to_do" }))).toBe(true);
    expect(isActionItemActive(makeActionItem({ status: "in_progress" }))).toBe(true);
  });

  it("excludes done and soft-deleted items", () => {
    expect(isActionItemActive(makeActionItem({ status: "done" }))).toBe(false);
    expect(
      isActionItemActive(
        makeActionItem({ status: "to_do", deletedAt: "2024-02-01T00:00:00.000Z" }),
      ),
    ).toBe(false);
  });
});

describe("filterActionItemsByStatus", () => {
  const items = [
    makeActionItem({ id: "a", status: "to_do" }),
    makeActionItem({ id: "b", status: "in_progress" }),
    makeActionItem({ id: "c", status: "to_do", deletedAt: "2024-02-01T00:00:00.000Z" }),
    makeActionItem({ id: "d", status: "done" }),
  ];

  it("returns matching, non-deleted items only", () => {
    expect(filterActionItemsByStatus(items, "to_do").map((i) => i.id)).toEqual(["a"]);
    expect(filterActionItemsByStatus(items, "done").map((i) => i.id)).toEqual(["d"]);
  });
});

describe("sortActionItemsByPriority", () => {
  it("orders high before medium before low", () => {
    const items = [
      makeActionItem({ id: "low", priority: "low" }),
      makeActionItem({ id: "high", priority: "high" }),
      makeActionItem({ id: "medium", priority: "medium" }),
    ];
    expect(sortActionItemsByPriority(items).map((i) => i.id)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });

  it("breaks ties by due date (earliest first)", () => {
    const items = [
      makeActionItem({ id: "later", priority: "high", dueDate: "2024-03-01T00:00:00.000Z" }),
      makeActionItem({ id: "sooner", priority: "high", dueDate: "2024-01-15T00:00:00.000Z" }),
    ];
    expect(sortActionItemsByPriority(items).map((i) => i.id)).toEqual([
      "sooner",
      "later",
    ]);
  });

  it("does not mutate the input array", () => {
    const items = [
      makeActionItem({ id: "low", priority: "low" }),
      makeActionItem({ id: "high", priority: "high" }),
    ];
    const before = items.map((i) => i.id);
    sortActionItemsByPriority(items);
    expect(items.map((i) => i.id)).toEqual(before);
  });
});

describe("getOpenActionItemsForReview", () => {
  it("returns only active items, sorted by priority", () => {
    const items = [
      makeActionItem({ id: "done", status: "done", priority: "high" }),
      makeActionItem({ id: "low", status: "to_do", priority: "low" }),
      makeActionItem({ id: "high", status: "in_progress", priority: "high" }),
      makeActionItem({
        id: "deleted",
        status: "to_do",
        priority: "high",
        deletedAt: "2024-02-01T00:00:00.000Z",
      }),
    ];
    expect(getOpenActionItemsForReview(items).map((i) => i.id)).toEqual([
      "high",
      "low",
    ]);
  });
});
