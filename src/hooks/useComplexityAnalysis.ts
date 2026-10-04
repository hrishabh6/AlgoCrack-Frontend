"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getComplexityAnalysisDetail,
  pollComplexityAnalysisDetail,
  requestComplexityAnalysis,
} from "@/lib/api/complexity-analysis";
import type { ComplexityAnalysisDetail } from "@/types/complexity";

export type ComplexityUiPhase = "idle" | "starting" | "polling" | "done" | "error";

export function useComplexityAnalysis(submissionId: string | null) {
  const [phase, setPhase] = useState<ComplexityUiPhase>("idle");
  const [detail, setDetail] = useState<ComplexityAnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setPhase("idle");
    setDetail(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    reset();
  }, [submissionId, reset]);

  const startAnalysis = useCallback(async () => {
    if (!submissionId || inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setPhase("starting");
    try {
      const ack = await requestComplexityAnalysis(submissionId);
      setPhase("polling");
      const initial = await getComplexityAnalysisDetail(submissionId, ack.analysisId);
      if (initial.status === "COMPLETED" || initial.status === "FAILED") {
        setDetail(initial);
        setPhase("done");
        return;
      }
      const terminal = await pollComplexityAnalysisDetail(submissionId, ack.analysisId, {
        intervalMs: Math.max(ack.pollAfterMs, 1000),
        signal: controller.signal,
      });
      setDetail(terminal);
      setPhase("done");
    } catch (e) {
      if (controller.signal.aborted) {
        setPhase("idle");
        return;
      }
      setError(e instanceof Error ? e.message : "Complexity analysis failed");
      setPhase("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [submissionId]);

  const busy = phase === "starting" || phase === "polling";

  return { phase, detail, error, busy, startAnalysis, reset };
}
