import { create } from "zustand";
import type { ProblemListSummary } from "@/types";

type ListDialog =
  | { kind: "create"; addProblemId?: number }
  | { kind: "rename"; list: ProblemListSummary }
  | { kind: "delete"; list: ProblemListSummary; onDeleted?: () => void };

interface ListDialogState {
  dialog: ListDialog | null;
  openCreate: (addProblemId?: number) => void;
  openRename: (list: ProblemListSummary) => void;
  openDelete: (list: ProblemListSummary, onDeleted?: () => void) => void;
  close: () => void;
}

/** Single source for the create / rename / delete list dialogs so any row or sidebar can open them. */
export const useListDialogStore = create<ListDialogState>()((set) => ({
  dialog: null,
  openCreate: (addProblemId) => set({ dialog: { kind: "create", addProblemId } }),
  openRename: (list) => set({ dialog: { kind: "rename", list } }),
  openDelete: (list, onDeleted) => set({ dialog: { kind: "delete", list, onDeleted } }),
  close: () => set({ dialog: null }),
}));
