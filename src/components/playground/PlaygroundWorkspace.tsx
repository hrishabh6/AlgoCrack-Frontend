"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { normalizeUnknownError } from "@/lib/error-utils";
import {
  createPlayground,
  deletePlayground,
  getPlayground,
  getPlaygroundLanguages,
  listPlaygrounds,
  runPlayground,
  updatePlayground,
} from "@/lib/api/playground-service";
import { toast } from "@/store";
import { usePlaygroundStore } from "@/store/usePlaygroundStore";
import type { PlaygroundLanguageCode } from "@/types/playground";
import { PlaygroundEditor } from "./PlaygroundEditor";
import { PlaygroundLibrary } from "./PlaygroundLibrary";
import { PlaygroundToolbar } from "./PlaygroundToolbar";
import { InputPanel } from "./InputPanel";
import { OutputPanel } from "./OutputPanel";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { PLAYGROUND_UI_ENABLED } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PlaygroundWorkspaceProps = {
  savedId?: number | null;
};

function confirmDiscard(): boolean {
  return window.confirm("You have unsaved changes. Discard them?");
}

export function PlaygroundWorkspace({ savedId = null }: PlaygroundWorkspaceProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const {
    workspace,
    languages,
    library,
    runStatus,
    lastRun,
    setLanguages,
    setLibrary,
    applyWorkspace,
    patchWorkspace,
    markBaselineFromWorkspace,
    isDirty,
    setRunStatus,
    setLastRun,
    starterForLanguage,
  } = usePlaygroundStore();

  const refreshLibrary = useCallback(async () => {
    try {
      const page = await listPlaygrounds(0, 20);
      setLibrary(page.content);
    } catch {
      // List failures must not destroy the open editor.
    }
  }, [setLibrary]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setBootError(null);
      try {
        const langs = await getPlaygroundLanguages();
        if (cancelled) return;
        setLanguages(langs);
        const defaultLang = langs[0]?.code ?? "JAVA";
        const starter = langs.find((l) => l.code === defaultLang)?.starterSource ?? "";

        if (savedId != null) {
          const detail = await getPlayground(savedId);
          if (cancelled) return;
          applyWorkspace(
            {
              id: detail.id,
              title: detail.title,
              language: detail.language,
              sourceCode: detail.sourceCode,
              stdin: detail.stdin,
            },
            true
          );
        } else {
          applyWorkspace(
            {
              id: null,
              title: "Untitled Playground",
              language: defaultLang,
              sourceCode: starter,
              stdin: "",
            },
            true
          );
        }
        await refreshLibrary();
      } catch (err) {
        if (!cancelled) {
          setBootError(normalizeUnknownError(err, "Playground is unavailable").message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedId, setLanguages, applyWorkspace, refreshLibrary]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [workspace, isDirty]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        void handleRun();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, runStatus, saving]);

  const handleResetStarter = () => {
    if (isDirty() && !window.confirm("Replace editor and stdin with the starter template?")) {
      return;
    }
    patchWorkspace({
      sourceCode: starterForLanguage(workspace.language),
      stdin: "",
    });
  };

  const handleLanguageChange = (language: PlaygroundLanguageCode) => {
    if (language === workspace.language) return;
    const currentStarter = starterForLanguage(workspace.language);
    const untouched = workspace.sourceCode === currentStarter;
    if (!untouched && isDirty()) {
      const replace = window.confirm(
        "Switch language and replace the editor with the new starter template?"
      );
      if (!replace) return;
      patchWorkspace({ language, sourceCode: starterForLanguage(language) });
      return;
    }
    patchWorkspace({
      language,
      sourceCode: untouched ? starterForLanguage(language) : workspace.sourceCode,
    });
  };

  const handleSave = async () => {
    if (saving || runStatus === "running") return;
    setSaving(true);
    try {
      const payload = {
        title: workspace.title.trim() || "Untitled Playground",
        language: workspace.language,
        sourceCode: workspace.sourceCode,
        stdin: workspace.stdin,
      };
      if (workspace.id == null) {
        const created = await createPlayground(payload);
        applyWorkspace(
          {
            id: created.id,
            title: created.title,
            language: created.language,
            sourceCode: created.sourceCode,
            stdin: created.stdin,
          },
          true
        );
        router.replace(`/playground/${created.id}`);
        toast.success("Playground saved");
      } else {
        const updated = await updatePlayground(workspace.id, payload);
        applyWorkspace(
          {
            id: updated.id,
            title: updated.title,
            language: updated.language,
            sourceCode: updated.sourceCode,
            stdin: updated.stdin,
          },
          true
        );
        toast.success("Changes saved");
      }
      await refreshLibrary();
    } catch (err) {
      toast.error("Save failed", normalizeUnknownError(err, "Could not save").message);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (runStatus === "running") return;
    setRunStatus("running");
    setLastRun(null);
    try {
      const result = await runPlayground({
        language: workspace.language,
        sourceCode: workspace.sourceCode,
        stdin: workspace.stdin,
      });
      setLastRun(result);
    } catch (err) {
      toast.error("Run failed", normalizeUnknownError(err, "Execution failed").message);
    } finally {
      setRunStatus("idle");
    }
  };

  const navigateNew = () => {
    if (isDirty() && !confirmDiscard()) return;
    router.push("/playground");
  };

  const navigateTo = (id: number) => {
    if (workspace.id === id) {
      setLibraryOpen(false);
      return;
    }
    if (isDirty() && !confirmDiscard()) return;
    router.push(`/playground/${id}`);
    setLibraryOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this playground permanently?")) return;
    try {
      await deletePlayground(id);
      await refreshLibrary();
      if (workspace.id === id) {
        router.push("/playground");
      }
      toast.success("Deleted");
    } catch (err) {
      toast.error("Delete failed", normalizeUnknownError(err, "Could not delete").message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-3rem)] items-center justify-center text-sm text-muted-foreground">
        Loading playground…
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="flex h-[calc(100dvh-3rem)] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">{bootError}</p>
        <p className="max-w-md text-xs text-muted-foreground">
          Enable playground API flags on Submission Service and gateway route, then sign in again.
        </p>
      </div>
    );
  }

  const dirty = isDirty();
  const running = runStatus === "running";

  const editorColumn = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <PlaygroundToolbar
        title={workspace.title}
        dirty={dirty}
        language={workspace.language}
        languages={languages}
        saving={saving}
        running={running}
        onTitleChange={(title) => patchWorkspace({ title })}
        onLanguageChange={handleLanguageChange}
        onSave={() => void handleSave()}
        onRun={() => void handleRun()}
        onResetStarter={handleResetStarter}
      />
      <PlaygroundEditor
        language={workspace.language}
        value={workspace.sourceCode}
        onChange={(sourceCode) => patchWorkspace({ sourceCode })}
      />
    </div>
  );

  const ioColumn = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={45} minSize={20}>
          <InputPanel value={workspace.stdin} onChange={(stdin) => patchWorkspace({ stdin })} disabled={running} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={25}>
          <OutputPanel run={lastRun} running={running} onClear={() => setLastRun(null)} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-3rem)] w-full flex-col overflow-hidden bg-background p-1.5">
      {PLAYGROUND_UI_ENABLED && (
        <Alert className="mb-1 py-2" role="status">
          <AlertDescription className="text-xs">
            Local playground uses in-process execution (not a hostile-code sandbox). Production requires
            isolated Kubernetes Jobs per{" "}
            <code className="text-[11px]">context/playground_sandbox_runbook.md</code>.
          </AlertDescription>
        </Alert>
      )}
      {!isDesktop && (
        <div className="mb-1 flex items-center gap-2 px-1">
          <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setLibraryOpen((o) => !o)}>
            <Menu className="h-4 w-4" />
            Saved
          </Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-1.5">
        {isDesktop ? (
          <PlaygroundLibrary
            className="w-[220px] shrink-0 rounded-lg"
            items={library}
            activeId={workspace.id}
            onNew={navigateNew}
            onSelect={navigateTo}
            onDelete={(id) => void handleDelete(id)}
          />
        ) : libraryOpen ? (
          <PlaygroundLibrary
            className="absolute inset-x-2 top-14 z-40 max-h-[50dvh] rounded-lg shadow-lg"
            items={library}
            activeId={workspace.id}
            onNew={navigateNew}
            onSelect={navigateTo}
            onDelete={(id) => void handleDelete(id)}
          />
        ) : null}

        {isDesktop ? (
          <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
            <ResizablePanel defaultSize={62} minSize={35}>
              {editorColumn}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={38} minSize={25}>
              {ioColumn}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <div className="min-h-[45dvh] flex-1">{editorColumn}</div>
            <div className="h-[min(40dvh,360px)] shrink-0">{ioColumn}</div>
          </div>
        )}
      </div>
    </div>
  );
}
