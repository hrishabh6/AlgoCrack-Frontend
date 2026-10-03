"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";

/** Loads the signed-in user's saved problems, lists and solved ids once; clears them on sign-out. */
export function ProblemLibrarySync() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const load = useProblemLibraryStore((s) => s.load);
  const reset = useProblemLibraryStore((s) => s.reset);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.userId) {
      reset();
      void load();
    } else {
      reset();
    }
  }, [isAuthenticated, isLoading, user?.userId, load, reset]);

  return null;
}
