"use client";

import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useEditorStore, useUserStore } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";

// Monaco cannot read CSS variables, so the surface colors from globals.css are mirrored here.
const defineThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("algocrack-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#17181b",
      "editor.lineHighlightBackground": "#1d1f23",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#4f5056",
      "editorLineNumber.activeForeground": "#9b9a97",
      "editorCursor.foreground": "#f0a04b",
      "editor.selectionBackground": "#f0a04b33",
      "editor.inactiveSelectionBackground": "#f0a04b1a",
      "editorIndentGuide.background1": "#2a2c31",
      "editorWidget.background": "#1d1f23",
      "editorWidget.border": "#383b42",
      "scrollbarSlider.background": "#383b4266",
      "scrollbarSlider.hoverBackground": "#383b42aa",
    },
  });
  monaco.editor.defineTheme("algocrack-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.lineHighlightBackground": "#f7f6f3",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#b5b0a7",
      "editorLineNumber.activeForeground": "#66625b",
      "editorCursor.foreground": "#c26a12",
      "editor.selectionBackground": "#c26a1226",
      "editorIndentGuide.background1": "#e6e3dd",
    },
  });
};

export function CodeEditor() {
  const { code, language, setCode, setEditorRef } = useEditorStore();
  const { theme, editorFontSize } = useUserStore();

  return (
    <div className="min-h-0 w-full flex-1 overflow-hidden bg-card">
      <Editor
        height="100%"
        language={language.toLowerCase()}
        value={code}
        onChange={(value) => setCode(value || "")}
        beforeMount={defineThemes}
        onMount={(editor) => setEditorRef(editor)}
        theme={theme === "light" ? "algocrack-light" : "algocrack-dark"}
        loading={
          <div className="flex h-full w-full flex-col gap-2 p-4" aria-label="Loading editor">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3.5 w-2/5" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: editorFontSize || 14,
          fontFamily: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
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
