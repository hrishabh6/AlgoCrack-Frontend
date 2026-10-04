"use client";

import { useComplexityAnalysis } from "@/hooks/useComplexityAnalysis";
import { isComplexityAnalysisEligible } from "@/lib/complexity/eligibility";
import {
  complexityResultKindLabel,
  complexityStatusLabel,
  limitationLabel,
} from "@/lib/complexity/status-labels";
import type { SubmitVerdict, ExecutionStatus } from "@/types/execution";
import type { ComplexityAnalysisDetail } from "@/types/complexity";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  submissionId: string;
  verdict: SubmitVerdict | null;
  status: ExecutionStatus;
  language: string;
};

export function ComplexityAnalysisPanel({ submissionId, verdict, status, language }: Props) {
  const eligible = isComplexityAnalysisEligible({ verdict, status, language });
  const { phase, detail, error, busy, startAnalysis } = useComplexityAnalysis(
    eligible ? submissionId : null
  );

  if (!eligible) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Complexity analysis</h3>
          <p className="text-xs text-muted-foreground">
            Estimates time and auxiliary-space complexity for this accepted submission.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void startAnalysis()}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              {phase === "starting" ? "Starting…" : "Analyzing…"}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" aria-hidden />
              Analyze Complexity
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {detail && <ComplexityResultBody detail={detail} phase={phase} />}
    </div>
  );
}

function ComplexityResultBody({
  detail,
  phase,
}: {
  detail: ComplexityAnalysisDetail;
  phase: string;
}) {
  const inProgress = detail.status !== "COMPLETED" && detail.status !== "FAILED";
  return (
    <div className="mt-4 space-y-4 border-t pt-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
          {inProgress ? complexityStatusLabel(detail.status) : complexityResultKindLabel(detail.resultKind)}
        </span>
        {detail.time?.confidence && (
          <span>Time confidence: {detail.time.confidence}</span>
        )}
        {detail.space?.confidence && (
          <span>Space confidence: {detail.space.confidence}</span>
        )}
        {phase === "polling" && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Loading" />
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <EstimateBlock title="Time" estimate={detail.time} />
        <EstimateBlock title="Auxiliary space" estimate={detail.space} />
      </div>

      {detail.variables.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variables</h4>
          <ul className="mt-1 space-y-1 text-sm">
            {detail.variables.map((v) => (
              <li key={v.name}>
                <span className="font-mono text-xs">{v.name}</span>
                <span className="text-muted-foreground"> — {v.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.evidence && (
        <section className="grid gap-3 md:grid-cols-2">
          {detail.evidence.staticEvidenceAvailable && detail.evidence.staticEvidence.length > 0 && (
            <EvidenceList title="Static evidence" items={detail.evidence.staticEvidence} />
          )}
          {detail.evidence.dynamicEvidenceAvailable && detail.evidence.dynamic.length > 0 && (
            <EvidenceList title="Dynamic evidence" items={detail.evidence.dynamic} />
          )}
        </section>
      )}

      {(detail.limitations.length > 0 || detail.reasonCodes.length > 0) && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Limitations</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {[...new Set([...detail.limitations, ...detail.reasonCodes])].map((code) => (
              <li key={code}>{limitationLabel(code)}</li>
            ))}
          </ul>
        </section>
      )}

      {detail.versions && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">Analysis versions</summary>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(detail.versions).map(([key, value]) =>
              value ? (
                <div key={key} className="contents">
                  <dt className="capitalize">{key}</dt>
                  <dd className="font-mono">{value}</dd>
                </div>
              ) : null
            )}
          </dl>
          {detail.requestedAt && (
            <p className="mt-2">Requested: {new Date(detail.requestedAt).toLocaleString()}</p>
          )}
          {detail.completedAt && (
            <p>Completed: {new Date(detail.completedAt).toLocaleString()}</p>
          )}
        </details>
      )}
    </div>
  );
}

function EstimateBlock({
  title,
  estimate,
}: {
  title: string;
  estimate: ComplexityAnalysisDetail["time"];
}) {
  if (!estimate?.expression && !estimate?.bigO) {
    return (
      <div className="rounded-md border bg-muted/30 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">Not available</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <p className={cn("mt-1 font-mono text-sm")}>{estimate.expression ?? estimate.bigO}</p>
      {estimate.bigO && estimate.expression && estimate.bigO !== estimate.expression && (
        <p className="text-xs text-muted-foreground">Class: {estimate.bigO}</p>
      )}
      {estimate.boundBasis && (
        <p className="text-xs text-muted-foreground">Basis: {estimate.boundBasis}</p>
      )}
    </div>
  );
}

function EvidenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-muted-foreground">
        {items.slice(0, 12).map((line) => (
          <li key={line} className="truncate">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
