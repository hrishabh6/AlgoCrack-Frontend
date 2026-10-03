"use client";

import { Button } from "@/components/ui/button";
import type { PlaygroundRunResponse } from "@/types/playground";
import { Copy, Eraser } from "lucide-react";

type OutputPanelProps = {
  run: PlaygroundRunResponse | null;
  running: boolean;
  onClear: () => void;
};

function headingForRun(run: PlaygroundRunResponse): string {
  switch (run.status) {
    case "SUCCESS":
      return "Output";
    case "COMPILE_ERROR":
      return "Compile error";
    case "RUNTIME_ERROR":
      return "Runtime error";
    case "TIME_LIMIT_EXCEEDED":
      return "Time limit exceeded";
    default:
      return "Execution error";
  }
}

export function OutputPanel({ run, running, onClear }: OutputPanelProps) {
  const copyText = () => {
    if (!run) return;
    const parts = [
      run.stdout,
      run.stderr,
      run.compilerOutput,
    ].filter(Boolean);
    void navigator.clipboard.writeText(parts.join("\n"));
  };

  let body = "";
  if (running) {
    body = "Running…";
  } else if (!run) {
    body = "Run your program to see output here.";
  } else if (run.status === "COMPILE_ERROR") {
    body = run.compilerOutput || run.stderr || "Compilation failed.";
  } else {
    body = [run.stdout, run.stderr].filter(Boolean).join("\n") || "(no output)";
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {running ? "Running…" : run ? headingForRun(run) : "Output"}
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={copyText} disabled={!run}>
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Copy output</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} disabled={!run && !running}>
            <Eraser className="h-3.5 w-3.5" />
            <span className="sr-only">Clear output</span>
          </Button>
        </div>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm">{body}</pre>
      {run?.outputTruncated && (
        <p className="border-t px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          Output truncated at 64 KiB.
        </p>
      )}
      {run && run.status === "SUCCESS" && (run.runtimeMs != null || run.memoryKb != null) && (
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          {run.runtimeMs != null && <>~{run.runtimeMs} ms</>}
          {run.memoryKb != null && <> · ~{run.memoryKb} KB memory</>}
        </p>
      )}
    </div>
  );
}
