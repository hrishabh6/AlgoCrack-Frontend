"use client";

import { Button } from "@/components/ui/button";
import { Play, Send, Loader2 } from "lucide-react";
import { useSubmissionStore } from "@/store";

export function ProblemActions() {
    const { isRunning, isSubmitting } = useSubmissionStore();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                size="sm"
                className="h-8 min-w-[80px]"
                disabled={isRunning || isSubmitting}
            // onClick={handleRun}
            >
                {isRunning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Play className="mr-2 h-4 w-4" />
                )}
                Run
            </Button>
            <Button
                size="sm"
                className="h-8 min-w-[80px]"
                disabled={isRunning || isSubmitting}
            // onClick={handleSubmit}
            >
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Submit
            </Button>
        </div>
    );
}
