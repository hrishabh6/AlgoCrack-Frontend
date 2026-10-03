"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PlaygroundWorkspace } from "@/components/playground/PlaygroundWorkspace";

export default function PlaygroundNewPage() {
  return (
    <ProtectedRoute>
      <PlaygroundWorkspace />
    </ProtectedRoute>
  );
}
