import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import type { UserProfileResponse, UserStats } from "@/types";

interface UserProgressState {
  userId: string | null;
  stats: UserStats | null;
  load: (userId: string, options?: { force?: boolean }) => Promise<void>;
  reset: () => void;
}

let inflight: Promise<void> | null = null;

/** Solved-by-difficulty totals for the signed-in user, shared by the problems toolbar and rail. */
export const useUserProgressStore = create<UserProgressState>()((set, get) => ({
  userId: null,
  stats: null,
  load: async (userId, { force = false } = {}) => {
    if (!force && get().userId === userId && (get().stats || inflight)) return inflight ?? undefined;
    if (get().userId !== userId) set({ userId, stats: null });
    inflight = apiClient
      .get<UserProfileResponse>(`${ENDPOINTS.USER_PROFILE}/${encodeURIComponent(userId)}?page=0&size=1`)
      .then((profile) => {
        if (get().userId === userId) set({ stats: profile.userStats });
      })
      .catch(() => {
        // Progress widgets stay hidden when the profile can't be loaded.
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },
  reset: () => set({ userId: null, stats: null }),
}));
