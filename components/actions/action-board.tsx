"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ListPlus, Search, Trash2 } from "lucide-react";

import {
  ActionItemDialog,
  dateInputToIso,
  emptyActionForm,
  isoToDateInput,
  type ActionItemFormValues,
} from "@/components/actions/action-item-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/ui-state/confirm-dialog";
import { EmptyState } from "@/components/ui-state/empty-state";
import { LoadingState } from "@/components/ui-state/loading-state";
import { ReadOnlyBanner } from "@/components/ui-state/read-only-banner";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { absoluteUrl } from "@/lib/clipboard";
import { formatDueDate, isPast } from "@/lib/dates";
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from "@/lib/labels";
import { sharedActionsRoute } from "@/lib/routes";
import { useAppStore } from "@/lib/use-session-data";
import { cn } from "@/lib/utils";
import { isSupabaseMode } from "@/lib/backend-mode";
import type {
  ActionBoardShare,
  ActionItem,
  ActionItemPriority,
  ActionItemStatus,
} from "@/types";

const PRIORITY_BADGE: Record<ActionItemPriority, "default" | "secondary" | "muted"> = {
  high: "default",
  medium: "secondary",
  low: "muted",
};

const MANUAL_SOURCE = "manual";

export function ActionBoard({
  workspaceId,
  readOnly = false,
}: {
  workspaceId: string;
  readOnly?: boolean;
}) {
  const store = useAppStore();
  const { toast } = useToast();
  const [remoteItems, setRemoteItems] = useState<ActionItem[] | undefined>(
    isSupabaseMode() ? undefined : [],
  );
  const [share, setShare] = useState<ActionBoardShare | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseMode()) {
      return;
    }
    let cancelled = false;
    void Promise.all([
      api.listActionItemsByWorkspace(workspaceId),
      api.getActionBoardShareByWorkspace(workspaceId),
    ])
      .then(([items, shareRecord]) => {
        if (!cancelled) {
          setRemoteItems(items as ActionItem[]);
          setShare(shareRecord);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load action items.",
          );
          setRemoteItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const [ownerFilter, setOwnerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [retroFilter, setRetroFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ActionItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActionItem | null>(null);
  const [revokeShareOpen, setRevokeShareOpen] = useState(false);

  const items = useMemo(() => {
    if (isSupabaseMode()) {
      return remoteItems ?? [];
    }
    return store
      ? store.actionItems.filter(
          (item) => item.workspaceId === workspaceId && item.deletedAt === null,
        )
      : [];
  }, [store, workspaceId, remoteItems]);

  const sessionNameById = useMemo(() => {
    const map = new Map<string, string>();
    store?.sessions.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [store]);

  if ((!isSupabaseMode() && !store) || (isSupabaseMode() && remoteItems === undefined)) {
    return <LoadingState variant="card" label="Loading action items…" />;
  }

  const owners = Array.from(new Set(items.map((item) => item.assignedToName))).sort();
  const retros = Array.from(new Set(items.map((item) => item.sourceSessionId)));

  const retroLabel = (id: string) =>
    id === MANUAL_SOURCE ? "Manual" : sessionNameById.get(id) ?? id;

  const filtered = items.filter((item) => {
    if (ownerFilter !== "all" && item.assignedToName !== ownerFilter) {
      return false;
    }
    if (priorityFilter !== "all" && item.priority !== priorityFilter) {
      return false;
    }
    if (retroFilter !== "all" && item.sourceSessionId !== retroFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${item.title} ${item.assignedToName} ${
        item.description ?? ""
      }`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const columns: { status: ActionItemStatus; label: string }[] = [
    { status: "to_do", label: "To do" },
    { status: "in_progress", label: "In progress" },
    { status: "done", label: "Done" },
  ];

  const copyShareValue = async () => {
    if (share) {
      return absoluteUrl(sharedActionsRoute(share.shareToken));
    }
    const created = await api.createActionBoardShare(workspaceId);
    setShare(created);
    return absoluteUrl(sharedActionsRoute(created.shareToken));
  };

  const regenerateShare = async () => {
    if (!share) {
      return;
    }
    try {
      const updated = await api.regenerateActionBoardShare(share.id);
      setShare(updated);
      toast("Share link regenerated. Copy the new link.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not regenerate link.",
        "error",
      );
    }
  };

  const revokeShare = async () => {
    if (!share) {
      return;
    }
    try {
      await api.revokeActionBoardShare(share.id);
      setShare(null);
      toast("Share link revoked.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not revoke link.",
        "error",
      );
    }
  };

  const submitCreate = (values: ActionItemFormValues) => {
    void api.createActionItem({
      workspaceId,
      sourceSessionId: MANUAL_SOURCE,
      title: values.title,
      description: values.description || null,
      assignedToName: values.assignedToName,
      dueDate: dateInputToIso(values.dueDate),
      priority: values.priority,
      status: values.status,
    })
      .then((item) => {
        if (isSupabaseMode()) {
          setRemoteItems((current) => [...(current ?? []), item]);
        }
        toast("Action item created.", "success");
      })
      .catch((error) => {
        toast(
          error instanceof Error ? error.message : "Failed to create action item.",
          "error",
        );
      });
    setCreating(false);
  };

  const submitEdit = (values: ActionItemFormValues) => {
    if (!editing) {
      return;
    }
    void api.updateActionItem(editing.id, {
      title: values.title,
      description: values.description || null,
      assignedToName: values.assignedToName,
      dueDate: dateInputToIso(values.dueDate),
      priority: values.priority,
      status: values.status,
    })
      .then((item) => {
        if (isSupabaseMode()) {
          setRemoteItems((current) =>
            (current ?? []).map((entry) => (entry.id === item.id ? item : entry)),
          );
        }
        toast("Action item updated.", "success");
      })
      .catch((error) => {
        toast(
          error instanceof Error ? error.message : "Failed to update action item.",
          "error",
        );
      });
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await api.softDeleteActionItem(deleteTarget.id);
      if (isSupabaseMode()) {
        setRemoteItems((current) =>
          (current ?? []).filter((entry) => entry.id !== deleteTarget.id),
        );
      }
      toast("Action item deleted.", "success");
      setEditing(null);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to delete action item.",
        "error",
      );
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        eyebrow={readOnly ? "Shared view" : "Facilitator"}
        title="Action Items Board"
        description="Track commitments across retros — assign owners, set due dates, and follow through."
        actions={
          readOnly ? undefined : (
            <>
              <CopyButton
                value=""
                label="Copy share link"
                onClickValue={copyShareValue}
                onCopied={() => toast("Share link copied.", "success")}
              />
              {share ? (
                <>
                  <Button variant="outline" onClick={() => void regenerateShare()}>
                    Regenerate link
                  </Button>
                  <Button variant="outline" onClick={() => setRevokeShareOpen(true)}>
                    Revoke link
                  </Button>
                </>
              ) : null}
              <Button onClick={() => setCreating(true)}>
                <ListPlus />
                New action item
              </Button>
            </>
          )
        }
      />

      {readOnly ? <ReadOnlyBanner /> : null}

      {loadError ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actions…"
                className="pl-9"
              />
            </div>
          </div>
          <FilterSelect
            label="Owner"
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[
              { value: "all", label: "All owners" },
              ...owners.map((owner) => ({ value: owner, label: owner })),
            ]}
          />
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: "all", label: "All priorities" },
              ...PRIORITY_OPTIONS.map((p) => ({
                value: p,
                label: PRIORITY_LABELS[p],
              })),
            ]}
          />
          <FilterSelect
            label="Retro"
            value={retroFilter}
            onChange={setRetroFilter}
            options={[
              { value: "all", label: "All retros" },
              ...retros.map((id) => ({ value: id, label: retroLabel(id) })),
            ]}
          />
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title="No action items"
          description={
            readOnly
              ? "This board has no action items yet."
              : "Create your first action item or capture one from a retro."
          }
          action={
            readOnly ? undefined : (
              <Button onClick={() => setCreating(true)}>
                <ListPlus />
                New action item
              </Button>
            )
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          compact
          description="No action items match your filters. Try adjusting search or filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => {
            const columnItems = filtered.filter(
              (item) => item.status === column.status,
            );
            return (
              <div key={column.status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{column.label}</h2>
                  <Badge variant="muted">{columnItems.length}</Badge>
                </div>
                <div className="space-y-3">
                  {columnItems.map((item) => (
                    <ActionCard
                      key={item.id}
                      item={item}
                      retroLabel={retroLabel(item.sourceSessionId)}
                      onClick={readOnly ? undefined : () => setEditing(item)}
                    />
                  ))}
                  {columnItems.length === 0 ? (
                    <EmptyState compact description={`No ${column.label.toLowerCase()} items.`} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating ? (
        <ActionItemDialog
          open
          onClose={() => setCreating(false)}
          title="New action item"
          submitLabel="Create"
          ownerOptions={owners}
          initial={emptyActionForm()}
          onSubmit={submitCreate}
        />
      ) : null}

      {editing ? (
        <ActionItemDialog
          open
          onClose={() => setEditing(null)}
          title="Edit action item"
          submitLabel="Save changes"
          ownerOptions={owners}
          initial={{
            title: editing.title,
            description: editing.description ?? "",
            assignedToName: editing.assignedToName,
            dueDate: isoToDateInput(editing.dueDate),
            priority: editing.priority,
            status: editing.status,
          }}
          onSubmit={submitEdit}
          footerExtra={
            <Button
              variant="ghost"
              className="mr-auto text-destructive"
              onClick={() => setDeleteTarget(editing)}
            >
              <Trash2 />
              Delete
            </Button>
          }
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete action item?"
        description="This action item will be removed from the board."
        confirmLabel="Delete"
        destructive
      />

      <ConfirmDialog
        open={revokeShareOpen}
        onClose={() => setRevokeShareOpen(false)}
        onConfirm={revokeShare}
        title="Revoke share link?"
        description="Anyone with the current link will lose access."
        confirmLabel="Revoke link"
        destructive
      />
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function ActionCard({
  item,
  retroLabel,
  onClick,
}: {
  item: ActionItem;
  retroLabel: string;
  onClick?: () => void;
}) {
  const overdue =
    item.dueDate &&
    item.status !== "done" &&
    isPast(item.dueDate);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:border-primary/50",
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          {overdue ? <Badge variant="default">Overdue</Badge> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Avatar name={item.assignedToName} className="size-5 text-[9px]" />
            {item.assignedToName}
          </span>
          <Badge variant={PRIORITY_BADGE[item.priority]}>
            {PRIORITY_LABELS[item.priority]}
          </Badge>
          {item.dueDate ? <span>Due {formatDueDate(item.dueDate)}</span> : null}
        </div>
        <p className="text-[11px] text-muted-foreground">From {retroLabel}</p>
      </CardContent>
    </Card>
  );
}
