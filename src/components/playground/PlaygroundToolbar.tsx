"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LanguageDescriptor, PlaygroundLanguageCode } from "@/types/playground";
import { Loader2, Play, RotateCcw, Save } from "lucide-react";

type PlaygroundToolbarProps = {
  title: string;
  dirty: boolean;
  language: PlaygroundLanguageCode;
  languages: LanguageDescriptor[];
  saving: boolean;
  running: boolean;
  onTitleChange: (title: string) => void;
  onLanguageChange: (language: PlaygroundLanguageCode) => void;
  onSave: () => void;
  onRun: () => void;
  onResetStarter: () => void;
};

export function PlaygroundToolbar({
  title,
  dirty,
  language,
  languages,
  saving,
  running,
  onTitleChange,
  onLanguageChange,
  onSave,
  onRun,
  onResetStarter,
}: PlaygroundToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card px-3 py-2">
      <span className="text-sm font-semibold text-muted-foreground">Playground</span>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="h-8 max-w-[220px] text-sm"
        aria-label="Playground title"
      />
      {dirty && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onResetStarter}
          disabled={running || saving}
          title="Reset to language starter template"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset starter</span>
        </Button>
        <Select value={language} onValueChange={(v) => onLanguageChange(v as PlaygroundLanguageCode)}>
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" variant="secondary" onClick={onSave} disabled={saving || running}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline">Save</span>
          <span className="sr-only">Save (Ctrl+S)</span>
        </Button>
        <Button type="button" size="sm" onClick={onRun} disabled={running || saving}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span className="ml-1">Run</span>
          <span className="sr-only">Run (Ctrl+Enter)</span>
        </Button>
      </div>
    </div>
  );
}
