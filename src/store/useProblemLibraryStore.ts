import { create } from "zustand";
import {
  addProblemToList,
  createProblemList,
  deleteProblemList,
  getMySolvedQuestionIds,
  getProblemListsOverview,
  removeProblemFromList,
  saveProblem,
  unsaveProblem,
  updateProblemList,
} from "@/lib/api/problem-lists-service";
import { normalizeUnknownError } from "@/lib/error-utils";
import { toast } from "./useToastStore";
import type { ProblemListInput, ProblemListSummary } from "@/types";

type LoadStatus = "idle" | "loading" | "ready" | "error";

/**
 * The signed-in user's Saved collection, custom lists (with membership ids) and solved problem ids.
 * Loaded once per session so every problem row can render bookmark/solved state without its own request.
 * Membership toggles are optimistic and roll back on failure.
 */
interface ProblemLibraryState {
  status: LoadStatus;
  savedIds: number[];
  lists: ProblemListSummary[];
  solvedIds: number[];
  /** Keys of in-flight membership changes: `saved:<problemId>` or `<listId>:<problemId>`. */
  pending: Record<string, true>;

  load: (options?: { force?: boolean }) => Promise<void>;
  reset: () => void;
  toggleSaved: (problemId: number) => Promise<void>;
  toggleInList: (listId: number, problemId: number) => Promise<void>;
  createList: (input: ProblemListInput) => Promise<ProblemListSummary>;
  updateList: (listId: number, input: ProblemListInput) => Promise<ProblemListSummary>;
  deleteList: (listId: number) => Promise<void>;
}

let inflightLoad: Promise<void> | null = null;

const errorMessage = (err: unknown, fallback: string) => normalizeUnknownError(err, fallback).message || fallback;

const withPending = (pending: Record<string, true>, key: string, on: boolean) => {
  const next = { ...pending };
  if (on) next[key] = true;
  else delete next[key];
  return next;
};

const withoutId = (ids: number[], id: number) => ids.filter((x) => x !== id);

export const useProblemLibraryStore = create<ProblemLibraryState>()((set, get) => ({
  status: "idle",
  savedIds: [],
  lists: [],
  solvedIds: [],
  pending: {},

  load: async ({ force = false } = {}) => {
    if (inflightLoad) return inflightLoad;
    if (!force && get().status === "ready") return;

    set((s) => ({ status: s.status === "ready" ? "ready" : "loading" }));
    inflightLoad = (async () => {
      try {
        const [overview, solved] = await Promise.all([
          getProblemListsOverview(),
          getMySolvedQuestionIds().catch(() => [] as number[]),
        ]);
        set({
          status: "ready",
          savedIds: overview.saved.problemIds,
          lists: overview.lists,
          solvedIds: solved,
        });
      } catch {
        set({ status: "error" });
      } finally {
        inflightLoad = null;
      }
    })();
    return inflightLoad;
  },

  reset: () => set({ status: "idle", savedIds: [], lists: [], solvedIds: [], pending: {} }),

  toggleSaved: async (problemId) => {
    const key = `saved:${problemId}`;
    if (get().pending[key]) return;
    const wasSaved = get().savedIds.includes(problemId);

    set((s) => ({
      pending: withPending(s.pending, key, true),
      savedIds: wasSaved ? withoutId(s.savedIds, problemId) : [problemId, ...s.savedIds],
    }));
    try {
      await (wasSaved ? unsaveProblem(problemId) : saveProblem(problemId));
    } catch (err) {
      set((s) => ({
        savedIds: wasSaved ? [problemId, ...withoutId(s.savedIds, problemId)] : withoutId(s.savedIds, problemId),
      }));
      toast.error(wasSaved ? "Couldn't remove from Saved" : "Couldn't save problem", errorMessage(err, "Please try again."));
    } finally {
      set((s) => ({ pending: withPending(s.pending, key, false) }));
    }
  },

  toggleInList: async (listId, problemId) => {
    const key = `${listId}:${problemId}`;
    if (get().pending[key]) return;
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return;
    const wasMember = list.problemIds.includes(problemId);

    const apply = (member: boolean) =>
      set((s) => ({
        lists: s.lists.map((l) => {
          if (l.id !== listId) return l;
          const ids = member ? [problemId, ...withoutId(l.problemIds, problemId)] : withoutId(l.problemIds, problemId);
          return { ...l, problemIds: ids, problemCount: ids.length };
        }),
      }));

    set((s) => ({ pending: withPending(s.pending, key, true) }));
    apply(!wasMember);
    try {
      await (wasMember ? removeProblemFromList(listId, problemId) : addProblemToList(listId, problemId));
    } catch (err) {
      apply(wasMember);
      toast.error(
        wasMember ? `Couldn't remove from “${list.name}”` : `Couldn't add to “${list.name}”`,
        errorMessage(err, "Please try again.")
      );
    } finally {
      set((s) => ({ pending: withPending(s.pending, key, false) }));
    }
  },

  createList: async (input) => {
    const created = await createProblemList(input);
    set((s) => ({ lists: [...s.lists, { ...created, problemIds: created.problemIds ?? [] }] }));
    return created;
  },

  updateList: async (listId, input) => {
    const updated = await updateProblemList(listId, input);
    set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, ...updated } : l)) }));
    return updated;
  },

  deleteList: async (listId) => {
    await deleteProblemList(listId);
    set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) }));
  },
}));
