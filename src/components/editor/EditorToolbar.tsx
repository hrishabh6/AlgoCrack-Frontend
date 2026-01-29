"use client";

// Button component removed as it's not used in this file
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { Play, Send } from "lucide-react"; // Removed as buttons are in Header
import { useEditorStore } from "@/store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export function EditorToolbar() {
    const { language, setLanguage } = useEditorStore();

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
        </div>
    );
}
