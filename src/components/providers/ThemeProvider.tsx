"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const theme = useUserStore((state) => state.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove existing theme class
        root.classList.remove("light", "dark");

        // Apply theme
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    return <>{children}</>;
}
