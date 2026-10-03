"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { API_URLS } from "@/lib/constants";
import { AuthDivider, AuthShell, GoogleButton, PasswordInput, errorMessageOf } from "@/components/auth/AuthShell";

import { Suspense } from "react";

function SignupContent() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/";

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // POST /auth/signup to Gateway
            // Expecting UserSignupRequestDto { name, email, password }
            await apiClient.post(
                "/api/v1/auth/signup",
                { name, email, password },
                { skipAuth: true }
            );

            // On success, redirect to signin with a stored message or just let them login
            router.push(`/auth/signin?registered=true&next=${encodeURIComponent(next)}`);
        } catch (err: unknown) {
            const message = errorMessageOf(err);
            setError(message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const redirectUri = `${window.location.origin}/oauth2/success?next=${encodeURIComponent(next)}`;
        window.location.href = `${API_URLS.GATEWAY}/api/v1/auth/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    return (
        <AuthShell
            title="Create an account"
            description="Enter your information to create an account"
            footer={
                <>
                    Already have an account?{" "}
                    <Link href={`/auth/signin?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <div className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Ada Lovelace"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" loading={isLoading}>
                        {isLoading ? "Creating account…" : "Create account"}
                    </Button>
                </form>
            </div>

            <AuthDivider />
            <GoogleButton onClick={handleGoogleLogin} />
        </AuthShell>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}>
            <SignupContent />
        </Suspense>
    );
}
