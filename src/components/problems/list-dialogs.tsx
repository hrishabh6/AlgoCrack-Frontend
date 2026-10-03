"use client";

import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUnknownError } from "@/lib/error-utils";
import { cn } from "@/lib/utils";
import { toast } from "@/store/useToastStore";
import { useListDialogStore } from "@/store/useListDialogStore";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";
import type { ProblemListSummary } from "@/types";

export const LIST_NAME_MAX = 60;
export const LIST_DESCRIPTION_MAX = 280;
const RESERVED_NAMES = ["saved"];

function validateName(name: string, lists: ProblemListSummary[], exceptId?: number): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give your list a name.";
  if (trimmed.length > LIST_NAME_MAX) return `Keep the name under ${LIST_NAME_MAX} characters.`;
  if (RESERVED_NAMES.includes(trimmed.toLowerCase())) return `“${trimmed}” is reserved. Pick another name.`;
  if (lists.some((l) => l.id !== exceptId && l.name.trim().toLowerCase() === trimmed.toLowerCase())) {
    return "You already have a list with this name.";
  }
  return null;
}

function ListFormDialog({
  mode,
  list,
  addProblemId,
  onClose,
}: {
  mode: "create" | "rename";
  list?: ProblemListSummary;
  addProblemId?: number;
  onClose: () => void;
}) {
  const lists = useProblemLibraryStore((s) => s.lists);
  const createList = useProblemLibraryStore((s) => s.createList);
  const updateList = useProblemLibraryStore((s) => s.updateList);
  const toggleInList = useProblemLibraryStore((s) => s.toggleInList);

  const [name, setName] = useState(list?.name ?? "");
  const [description, setDescription] = useState(list?.description ?? "");
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameId = useId();
  const descriptionId = useId();
  const errorId = useId();

  const nameError = validateName(name, lists, list?.id);
  const descriptionError =
    description.trim().length > LIST_DESCRIPTION_MAX ? `Keep the description under ${LIST_DESCRIPTION_MAX} characters.` : null;
  const shownError = serverError ?? (touched ? nameError : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError || descriptionError || submitting) return;
    setSubmitting(true);
    setServerError(null);
    const input = { name: name.trim(), description: description.trim() };
    try {
      if (mode === "create") {
        const created = await createList(input);
        if (addProblemId !== undefined) await toggleInList(created.id, addProblemId);
        toast.success(
          addProblemId !== undefined ? `Created “${created.name}” and added the problem` : `Created “${created.name}”`
        );
      } else if (list) {
        const updated = await updateList(list.id, input);
        toast.success(`Saved changes to “${updated.name}”`);
      }
      onClose();
    } catch (err) {
      setServerError(normalizeUnknownError(err, "Something went wrong. Please try again.").message);
    } finally {
      setSubmitting(false);
    }
  };

  const formId = `list-form-${mode}`;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={mode === "create" ? "New list" : "Edit list"}
      description={
        mode === "create" ? "Group problems for revision, a topic drill or an upcoming interview." : undefined
      }
      footer={
        <>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form={formId} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            {mode === "create" ? "Create list" : "Save"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor={nameId}>Name</Label>
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums text-subtle-foreground",
                name.trim().length > LIST_NAME_MAX && "text-destructive"
              )}
            >
              {name.trim().length}/{LIST_NAME_MAX}
            </span>
          </div>
          <Input
            id={nameId}
            value={name}
            autoFocus
            autoComplete="off"
            placeholder="e.g. Graph revision"
            aria-invalid={Boolean(shownError)}
            aria-describedby={shownError ? errorId : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setServerError(null);
            }}
            onBlur={() => setTouched(true)}
          />
          {shownError && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {shownError}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor={descriptionId}>
              Description <span className="font-normal text-subtle-foreground">(optional)</span>
            </Label>
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums text-subtle-foreground",
                descriptionError && "text-destructive"
              )}
            >
              {description.trim().length}/{LIST_DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            id={descriptionId}
            value={description}
            rows={3}
            placeholder="What is this list for?"
            aria-invalid={Boolean(descriptionError)}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
          />
          {descriptionError && <p className="text-xs text-destructive">{descriptionError}</p>}
        </div>
      </form>
    </Dialog>
  );
}

function DeleteListDialog({
  list,
  onDeleted,
  onClose,
}: {
  list: ProblemListSummary;
  onDeleted?: () => void;
  onClose: () => void;
}) {
  const deleteList = useProblemLibraryStore((s) => s.deleteList);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    setSubmitting(true);
    try {
      await deleteList(list.id);
      toast.success(`Deleted “${list.name}”`);
      onClose();
      onDeleted?.();
    } catch (err) {
      toast.error("Couldn't delete list", normalizeUnknownError(err, "Please try again.").message);
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Delete this list?"
      description={
        <>
          “{list.name}” and its {list.problemCount} {list.problemCount === 1 ? "entry" : "entries"} will be removed.
          The problems themselves and your submissions are not affected.
        </>
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={confirm} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Delete list
          </Button>
        </>
      }
    />
  );
}

/** Mount once per page tree; renders whichever list dialog is open in {@link useListDialogStore}. */
export function ListDialogs() {
  const dialog = useListDialogStore((s) => s.dialog);
  const close = useListDialogStore((s) => s.close);
  const status = useProblemLibraryStore((s) => s.status);

  useEffect(() => {
    if (status === "idle") close();
  }, [status, close]);

  if (!dialog) return null;
  if (dialog.kind === "delete") return <DeleteListDialog list={dialog.list} onDeleted={dialog.onDeleted} onClose={close} />;
  if (dialog.kind === "rename") return <ListFormDialog key={`rename-${dialog.list.id}`} mode="rename" list={dialog.list} onClose={close} />;
  return <ListFormDialog key="create" mode="create" addProblemId={dialog.addProblemId} onClose={close} />;
}
