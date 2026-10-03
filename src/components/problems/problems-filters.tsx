"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared";
import { X } from "lucide-react";
import { Tag } from "@/types";

interface ProblemsFiltersProps {
    availableTags: Tag[];
}

export function ProblemsFilters({ availableTags }: ProblemsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all");
    const [tag, setTag] = useState(searchParams.get("tag") || "all");

    const applyFilters = (newParams: {
        search?: string;
        difficulty?: string;
        tag?: string;
    }) => {
        const params = new URLSearchParams(searchParams.toString());

        // Update params based on input
        if (newParams.search !== undefined) {
            if (newParams.search) params.set("search", newParams.search);
            else params.delete("search");
        }

        if (newParams.difficulty !== undefined) {
            if (newParams.difficulty && newParams.difficulty !== "all") {
                params.set("difficulty", newParams.difficulty);
            } else {
                params.delete("difficulty");
            }
        }

        if (newParams.tag !== undefined) {
            if (newParams.tag && newParams.tag !== "all") {
                params.set("tag", newParams.tag);
            } else {
                params.delete("tag");
            }
        }

        // Reset pagination to page 0 when filtering
        params.set("page", "0");

        router.push(`/problems?${params.toString()}`);
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only apply if search changed (avoid initial render double fetch if params match)
            if (search !== (searchParams.get("search") || "")) {
                applyFilters({ search });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const clearFilters = () => {
        setSearch("");
        setDifficulty("all");
        setTag("all");
        router.push("/problems");
    };

    const hasFilters = Boolean(search) || difficulty !== "all" || tag !== "all";

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search problems…"
                aria-label="Search problems"
                containerClassName="w-full sm:max-w-xs"
            />

            <div className="flex items-center gap-2">
                <Select
                    value={difficulty}
                    onValueChange={(val) => {
                        setDifficulty(val);
                        applyFilters({ difficulty: val });
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[140px]" aria-label="Filter by difficulty">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All difficulties</SelectItem>
                        <SelectItem value="Easy">
                            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                            Easy
                        </SelectItem>
                        <SelectItem value="Medium">
                            <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                            Medium
                        </SelectItem>
                        <SelectItem value="Hard">
                            <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
                            Hard
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={tag}
                    onValueChange={(val) => {
                        setTag(val);
                        applyFilters({ tag: val });
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by tag">
                        <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
                        {availableTags.map((t) => (
                            <SelectItem key={t.id} value={t.name}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                    <X />
                    Reset
                </Button>
            )}
        </div>
    );
}
