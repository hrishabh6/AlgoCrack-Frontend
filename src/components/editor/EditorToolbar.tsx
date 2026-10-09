"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlignLeft, Code2 } from "lucide-react";
import { useEditorStore } from "@/store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { ProblemActions } from "@/components/problems/problem-actions";
import { FocusModeToggle } from "@/components/focus-mode/FocusModeToggle";
import { PanelMaximizeToggle } from "@/components/focus-mode/PanelMaximizeToggle";
import { useWorkspaceLayout } from "@/components/focus-mode/WorkspaceLayoutContext";
import { useFocusMode } from "@/hooks/useFocusMode";
import { shouldIgnorePanelHeaderDoubleClick } from "@/lib/focus-mode/panels";
import { shouldHideAppChrome } from "@/lib/focus-mode/routes";
import { usePathname } from "next/navigation";

export function EditorToolbar() {
    const pathname = usePathname();
    const { isActive: focusModeActive } = useFocusMode();
    const focusChromeHidden = shouldHideAppChrome(pathname, focusModeActive);
    const { toggleMaximizedPanel } = useWorkspaceLayout();
    const { language, setLanguage, editorRef } = useEditorStore();

    const handleFormat = () => {
        if (editorRef) {
            editorRef.getAction('editor.action.formatDocument').run();
        }
    };

    return (
        <div
            className="flex h-9 shrink-0 items-center justify-between gap-2 border-b bg-surface-2 px-2"
            onDoubleClick={(event) => {
                if (shouldIgnorePanelHeaderDoubleClick(event.target)) return;
                toggleMaximizedPanel("editor");
            }}
        >
            <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 pl-1 text-xs font-medium text-muted-foreground sm:flex">
                    <Code2 className="size-3.5 text-primary" aria-hidden="true" />
                    Code
                </span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger size="sm" className="h-7 w-[112px] text-xs" aria-label="Language">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-1">
                <PanelMaximizeToggle panel="editor" />
                {!focusChromeHidden && <FocusModeToggle />}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={handleFormat}
                    title="Format code"
                    aria-label="Format code"
                    disabled={!editorRef}
                >
                    <AlignLeft />
                </Button>
                {!focusChromeHidden && (
                    <div className="md:hidden">
                        <ProblemActions />
                    </div>
                )}
            </div>
        </div>
    );
}
