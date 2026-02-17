"use client";

// Button component removed as it's not used in this file
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlignLeft } from "lucide-react";
import { useEditorStore, useUserStore } from "@/store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export function EditorToolbar() {
    const { language, setLanguage, editorRef } = useEditorStore();
    const { theme } = useUserStore();

    const handleFormat = () => {
        if (editorRef) {
            editorRef.getAction('editor.action.formatDocument').run();
        }
    };

    return (
        <div className="flex items-center justify-between border-b bg-background p-2">
            <div className="flex items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue placeholder="Select Language" />
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
            
            <div className="flex items-center gap-2">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleFormat}
                    title="Format Code"
                    disabled={!editorRef}
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
