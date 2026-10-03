import type { BeforeMount } from "@monaco-editor/react";

export const defineAlgoCrackMonacoThemes: BeforeMount = (monaco) => {
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
