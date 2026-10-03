import { create } from "zustand";
import { getStreak } from "@/lib/api/problem-lists-service";
import type { Streak } from "@/types";

interface StreakState {
  userId: string | null;
  streak: Streak | null;
  load: (userId: string) => Promise<void>;
  /** Re-fetch for the current user, e.g. after a submission. */
  refresh: () => Promise<void>;
  reset: () => void;
}

let inflight: Promise<void> | null = null;

/** Submission streak for the signed-in user, shared by the navbar badge and the profile page. */
export const useStreakStore = create<StreakState>()((set, get) => ({
  userId: null,
  streak: null,
  load: async (userId) => {
    if (get().userId === userId && (get().streak || inflight)) return inflight ?? undefined;
    set({ userId, streak: null });
    inflight = getStreak(userId)
      .then((streak) => {
        if (get().userId === userId) set({ streak });
      })
      .catch(() => {
        // The badge simply stays hidden when the streak can't be loaded.
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },
  refresh: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const streak = await getStreak(userId);
      if (get().userId === userId) set({ streak });
    } catch {
      // Keep the last known value.
    }
  },
  reset: () => set({ userId: null, streak: null }),
}));
