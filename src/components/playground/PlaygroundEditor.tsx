"use client";

import Editor from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";
import { defineAlgoCrackMonacoThemes } from "@/lib/editor/monaco-themes";
import { useUserStore } from "@/store";

type PlaygroundEditorProps = {
  language: string;
  value: string;
  onChange: (value: string) => void;
};

export function PlaygroundEditor({ language, value, onChange }: PlaygroundEditorProps) {
  const { theme, editorFontSize } = useUserStore();
  const monacoLanguage = language.toLowerCase() === "python" ? "python" : "java";

  return (
    <div className="min-h-0 w-full flex-1 overflow-hidden bg-card">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={defineAlgoCrackMonacoThemes}
        theme={theme === "light" ? "algocrack-light" : "algocrack-dark"}
        loading={
          <div className="flex h-full w-full flex-col gap-2 p-4" aria-label="Loading editor">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: editorFontSize || 14,
          fontFamily: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          formatOnType: true,
          formatOnPaste: true,
          renderLineHighlight: "all",
          smoothScrolling: true,
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  );
}
