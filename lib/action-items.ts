import type { ActionItem, ActionItemStatus } from "@/types";

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  to_do: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function isActionItemOpen(item: ActionItem): boolean {
  return item.status !== "done" && item.deletedAt === null;
}

export function isActionItemActive(item: ActionItem): boolean {
  return (
    item.deletedAt === null &&
    (item.status === "to_do" || item.status === "in_progress")
  );
}

export function sortActionItemsByPriority(items: ActionItem[]): ActionItem[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...items].sort((a, b) => {
    const priorityDiff =
      priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return new Date(a.dueDate ?? a.createdAt).getTime() -
      new Date(b.dueDate ?? b.createdAt).getTime();
  });
}

export function filterActionItemsByStatus(
  items: ActionItem[],
  status: ActionItemStatus,
): ActionItem[] {
  return items.filter((item) => item.status === status && item.deletedAt === null);
}

export function getOpenActionItemsForReview(items: ActionItem[]): ActionItem[] {
  return sortActionItemsByPriority(items.filter(isActionItemActive));
}
