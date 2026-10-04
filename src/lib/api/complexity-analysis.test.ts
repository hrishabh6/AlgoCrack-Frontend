import { describe, expect, it, vi, beforeEach } from "vitest";
import { pollComplexityAnalysisDetail } from "./complexity-analysis";
import type { ComplexityAnalysisDetail } from "@/types/complexity";

vi.mock("../api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "../api-client";

const detail = (status: ComplexityAnalysisDetail["status"]): ComplexityAnalysisDetail => ({
  analysisId: "a-1",
  submissionId: "s-1",
  status,
  resultKind: status === "COMPLETED" ? "HYBRID" : null,
  language: "java",
  requestedAt: "2026-01-01T00:00:00",
  completedAt: null,
  time: null,
  space: null,
  variables: [],
  evidence: null,
  limitations: [],
  versions: null,
  reused: false,
  reasonCodes: [],
});

describe("pollComplexityAnalysisDetail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("stops on completed status", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(detail("COMPLETED"));
    const result = await pollComplexityAnalysisDetail("s-1", "a-1", {
      maxAttempts: 3,
      intervalMs: 1,
    });
    expect(result.status).toBe("COMPLETED");
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it("respects abort signal", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(detail("QUEUED"));
    const controller = new AbortController();
    controller.abort();
    await expect(
      pollComplexityAnalysisDetail("s-1", "a-1", { signal: controller.signal, intervalMs: 1 })
    ).rejects.toThrow(/cancelled/i);
  });
});
