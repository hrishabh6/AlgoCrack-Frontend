"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PlaygroundWorkspace } from "@/components/playground/PlaygroundWorkspace";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PlaygroundSavedPage({ params }: PageProps) {
  const { id } = use(params);
  const numericId = Number(id);
  const savedId = Number.isFinite(numericId) ? numericId : null;

  return (
    <ProtectedRoute>
      <PlaygroundWorkspace savedId={savedId} />
    </ProtectedRoute>
  );
}
