"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";
import { useStreakStore } from "@/store/useStreakStore";

/**
 * Loads the signed-in user's saved problems, lists, solved ids and streak once per session;
 * clears them on sign-out.
 */
export function ProblemLibrarySync() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const load = useProblemLibraryStore((s) => s.load);
  const reset = useProblemLibraryStore((s) => s.reset);
  const loadStreak = useStreakStore((s) => s.load);
  const resetStreak = useStreakStore((s) => s.reset);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.userId) {
      reset();
      void load();
      void loadStreak(String(user.userId));
    } else {
      reset();
      resetStreak();
    }
  }, [isAuthenticated, isLoading, user?.userId, load, reset, loadStreak, resetStreak]);

  return null;
}
