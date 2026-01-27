"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
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

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
            <div className="flex flex-1 items-center gap-4 max-w-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search problems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <Select
                    value={difficulty}
                    onValueChange={(val) => {
                        setDifficulty(val);
                        applyFilters({ difficulty: val });
                    }}
                >
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={tag}
                    onValueChange={(val) => {
                        setTag(val);
                        applyFilters({ tag: val });
                    }}
                >
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {availableTags.map((t) => (
                            <SelectItem key={t.id} value={t.name}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {(search || difficulty !== "all" || tag !== "all") && (
                <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                    Reset Filters
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
