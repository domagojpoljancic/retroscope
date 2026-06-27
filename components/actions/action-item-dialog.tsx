"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "@/lib/labels";
import { validateActionItemForm } from "@/lib/validation";
import type { ActionItemPriority, ActionItemStatus } from "@/types";

export interface ActionItemFormValues {
  title: string;
  description: string;
  assignedToName: string;
  dueDate: string; // yyyy-mm-dd or ""
  priority: ActionItemPriority;
  status: ActionItemStatus;
}

export function emptyActionForm(): ActionItemFormValues {
  return {
    title: "",
    description: "",
    assignedToName: "",
    dueDate: "",
    priority: "medium",
    status: "to_do",
  };
}

export function isoToDateInput(iso: string | null): string {
  if (!iso) {
    return "";
  }
  return new Date(iso).toISOString().slice(0, 10);
}

export function dateInputToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  return new Date(`${value}T12:00:00`).toISOString();
}

export function ActionItemDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  initial,
  ownerOptions = [],
  footerExtra,
  requireOwner = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ActionItemFormValues) => void;
  title: string;
  submitLabel: string;
  initial: ActionItemFormValues;
  ownerOptions?: string[];
  footerExtra?: React.ReactNode;
  requireOwner?: boolean;
}) {
  const [values, setValues] = useState<ActionItemFormValues>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof ActionItemFormValues>(
    key: K,
    value: ActionItemFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const submit = () => {
    const validation = validateActionItemForm(values, { requireOwner });
    if (!validation.ok) {
      const key = validation.error.includes("Title")
        ? "title"
        : validation.error.includes("Owner")
          ? "assignedToName"
          : validation.error.includes("due date")
            ? "dueDate"
            : validation.error.includes("Priority")
              ? "priority"
              : validation.error.includes("Status")
                ? "status"
                : "form";
      setFieldErrors({ [key]: validation.error });
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      assignedToName: values.assignedToName.trim() || "Unassigned",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          {footerExtra}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{submitLabel}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ai-title">Title</Label>
          <Textarea
            id="ai-title"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="What needs to happen?"
            className="min-h-16"
            aria-invalid={Boolean(fieldErrors.title)}
          />
          <InlineValidationMessage message={fieldErrors.title} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-owner">Owner (display name)</Label>
          <Input
            id="ai-owner"
            list="owner-options"
            value={values.assignedToName}
            onChange={(event) => update("assignedToName", event.target.value)}
            placeholder="e.g. Marta Novak"
            aria-invalid={Boolean(fieldErrors.assignedToName)}
          />
          <datalist id="owner-options">
            {ownerOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <InlineValidationMessage message={fieldErrors.assignedToName} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-due">Due date</Label>
            <Input
              id="ai-due"
              type="date"
              value={values.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
              aria-invalid={Boolean(fieldErrors.dueDate)}
            />
            <InlineValidationMessage message={fieldErrors.dueDate} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-priority">Priority</Label>
            <Select
              id="ai-priority"
              value={values.priority}
              onChange={(event) =>
                update("priority", event.target.value as ActionItemPriority)
              }
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {PRIORITY_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-status">Status</Label>
            <Select
              id="ai-status"
              value={values.status}
              onChange={(event) =>
                update("status", event.target.value as ActionItemStatus)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <InlineValidationMessage message={fieldErrors.form} />
      </div>
    </Modal>
  );
}
