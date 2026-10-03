export type Tone = "success" | "warning" | "danger" | "info" | "muted";

interface VerdictMeta {
  label: string;
  tone: Tone;
}

const VERDICTS: Record<string, VerdictMeta> = {
  ACCEPTED: { label: "Accepted", tone: "success" },
  PASSED_RUN: { label: "All Tests Passed", tone: "success" },
  WRONG_ANSWER: { label: "Wrong Answer", tone: "danger" },
  FAILED_RUN: { label: "Wrong Answer", tone: "danger" },
  RUNTIME_ERROR: { label: "Runtime Error", tone: "danger" },
  RUNTIME_ERROR_RUN: { label: "Runtime Error", tone: "danger" },
  COMPILATION_ERROR: { label: "Compilation Error", tone: "warning" },
  COMPILATION_ERROR_RUN: { label: "Compilation Error", tone: "warning" },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", tone: "warning" },
  TIMEOUT_RUN: { label: "Time Limit Exceeded", tone: "warning" },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", tone: "warning" },
  MEMORY_LIMIT_RUN: { label: "Memory Limit Exceeded", tone: "warning" },
  INTERNAL_ERROR_RUN: { label: "Internal Error", tone: "danger" },
};

const STATUSES: Record<string, VerdictMeta> = {
  PENDING: { label: "Pending", tone: "info" },
  QUEUED: { label: "Queued", tone: "info" },
  COMPILING: { label: "Compiling", tone: "info" },
  RUNNING: { label: "Running", tone: "info" },
  COMPLETED: { label: "Completed", tone: "muted" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "muted" },
};

function humanize(code: string): string {
  return code
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Resolve display label and tone for a verdict, falling back to the execution status. */
export function getVerdictMeta(
  verdict?: string | null,
  status?: string | null
): VerdictMeta {
  if (verdict) return VERDICTS[verdict] ?? { label: humanize(verdict), tone: "muted" };
  if (status) return STATUSES[status] ?? { label: humanize(status), tone: "muted" };
  return { label: "Unknown", tone: "muted" };
}

export function formatMemoryKb(memoryKb: number | null | undefined): string | null {
  if (memoryKb === null || memoryKb === undefined) return null;
  return `${(memoryKb / 1024).toFixed(1)} MB`;
}

export function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return "—";
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.floor((Date.now() - then) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 35) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}
