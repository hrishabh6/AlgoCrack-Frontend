"use client";

import { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorStore, useUserStore } from "@/store";
import { Loader2 } from "lucide-react";

export function CodeEditor() {
  const { code, language, setCode } = useEditorStore();
  const { theme } = useUserStore();
  // Removed mounted state and effect; editor renders directly
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // Define custom themes if needed, or stick to vs-dark/light
      // For now, we map our app theme to monaco theme
      const monacoTheme = theme === "dark" ? "vs-dark" : "light";
      monaco.editor.setTheme(monacoTheme);
    }
  }, [theme, monaco]);



  return (
    <div className="h-full w-full overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language.toLowerCase()}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
