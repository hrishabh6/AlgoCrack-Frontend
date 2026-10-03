"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/shared";
import { cn } from "@/lib/utils";

interface AuthShellProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
    return (
        <div className="flex min-h-[calc(100dvh-3rem-73px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-[380px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <Link href="/" aria-label="AlgoCrack home" className="mb-5 rounded-md">
                        <BrandMark showWordmark={false} className="scale-125" />
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="rounded-lg border bg-card p-5 sm:p-6">{children}</div>
                <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
            </div>
        </div>
    );
}

export function AuthDivider() {
    return (
        <div className="relative my-5" role="separator">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-card px-2 text-[11px] uppercase tracking-wider text-subtle-foreground">
                    Or continue with
                </span>
            </div>
        </div>
    );
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
    return (
        <Button variant="outline" type="button" className="w-full" onClick={onClick}>
            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
        </Button>
    );
}

export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-subtle-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
            >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}

/** Extract a message from whatever the API client threw. */
export function errorMessageOf(err: unknown): string {
    if (typeof err === "object" && err !== null && "message" in err) {
        return String((err as { message: unknown }).message ?? "");
    }
    return "";
}
