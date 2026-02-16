"use client";

import { useState } from "react";
import { useEditorStoreCompat } from "@/store";
import { Button } from "@/components/ui/button";
import { Plus, X, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function CustomTestCasesPanel() {
    const {
        customTestCases,
        addCustomTestCase,
        removeCustomTestCase,
        updateCustomTestCase,
        currentProblem
    } = useEditorStoreCompat();

    const [newTestCase, setNewTestCase] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const handleAddTestCase = () => {
        if (!newTestCase.trim()) return;

        try {
            const parsed = JSON.parse(newTestCase);
            addCustomTestCase({ input: parsed });
            setNewTestCase("");
        } catch (e) {
            alert("Invalid JSON format. Please check your input.");
        }
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditValue(JSON.stringify(customTestCases[index].input, null, 2));
    };

    const handleSaveEdit = () => {
        if (editIndex === null) return;

        try {
            const parsed = JSON.parse(editValue);
            updateCustomTestCase(editIndex, { input: parsed });
            setEditIndex(null);
            setEditValue("");
        } catch (e) {
            alert("Invalid JSON format. Please check your input.");
        }
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditValue("");
    };

    // Get parameter names from problem metadata for hints
    const paramNames = currentProblem?.metadataList?.[0]?.paramNames || [];

    return (
        <div className="flex flex-col h-full">
            <div className="border-b px-4 py-2">
                <h3 className="font-semibold text-sm">Custom Test Cases</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Add your own test cases. Format: JSON object with keys: {paramNames.join(", ") || "check problem description"}
                </p>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {/* Existing Custom Test Cases */}
                    {customTestCases.map((tc, index) => (
                        <div key={index} className="border rounded-md p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Case {index + 1}</span>
                                <div className="flex gap-2">
                                    {editIndex === index ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleSaveEdit}
                                                className="h-6 px-2"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCancelEdit}
                                                className="h-6 px-2"
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(index)}
                                                className="h-6 px-2"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeCustomTestCase(index)}
                                                className="h-6 px-2 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {editIndex === index ? (
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full min-h-[80px] p-2 bg-muted rounded font-mono text-xs"
                                    placeholder='{"nums": [1,2,3], "target": 5}'
                                />
                            ) : (
                                <pre className="bg-muted p-2 rounded font-mono text-xs overflow-x-auto">
                                    {JSON.stringify(tc.input, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}

                    {/* Add New Test Case */}
                    <div className="border-2 border-dashed rounded-md p-3 space-y-2">
                        <label className="text-sm font-medium">Add New Test Case</label>
                        <textarea
                            value={newTestCase}
                            onChange={(e) => setNewTestCase(e.target.value)}
                            className="w-full min-h-[100px] p-2 bg-muted rounded font-mono text-xs"
                            placeholder={`Example:\n{\n  "nums": [1, 2, 3],\n  "target": 5\n}`}
                        />
                        <Button
                            onClick={handleAddTestCase}
                            size="sm"
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Test Case
                        </Button>
                    </div>

                    {customTestCases.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            No custom test cases yet. Add one above to test your code with custom inputs.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
