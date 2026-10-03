"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { API_URLS } from "@/lib/constants";
import { AuthDivider, AuthShell, GoogleButton, PasswordInput, errorMessageOf } from "@/components/auth/AuthShell";

import { Suspense } from "react";

function SignInContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/";
    const justRegistered = searchParams.get("registered") === "true";
    const oauthError = searchParams.get("error");

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // POST /auth/signin to Gateway
            const response = await apiClient.post<{ token: string; type: string }>(
                "/api/v1/auth/signin",
                { email, password },
                { skipAuth: true } // Don't attach existing token if any
            );

            if (response.token) {
                login(response.token);
                router.push(next);
            } else {
                setError("Login failed: No token received");
            }
        } catch (err: unknown) {
            // Parse error message if possible
            const message = errorMessageOf(err);
            let msg = "Invalid credentials";
            if (message && message.includes("401")) msg = "Invalid email or password";
            else if (message) msg = message;
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to Gateway OAuth endpoint with redirect_uri
        // The redirect_uri tells backend where to send user after Google Auth
        // We send them to our OAuth success page, passing the 'next' param along
        const redirectUri = `${window.location.origin}/oauth2/success?next=${encodeURIComponent(next)}`;
        window.location.href = `${API_URLS.GATEWAY}/api/v1/auth/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    return (
        <AuthShell
            title="Sign in to AlgoCrack"
            description="Enter your email and password to access your account"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/signup?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </>
            }
        >
            <div className="space-y-4">
                {justRegistered && !error && (
                    <Alert variant="success">
                        <CheckCircle2 className="size-4" />
                        <AlertDescription>Account created. Sign in to continue.</AlertDescription>
                    </Alert>
                )}
                {(error || oauthError) && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{error || `Google sign-in failed: ${oauthError}`}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleManualLogin} className="space-y-4">
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
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" loading={isLoading}>
                        {isLoading ? "Signing in…" : "Sign in"}
                    </Button>
                </form>
            </div>

            <AuthDivider />
            <GoogleButton onClick={handleGoogleLogin} />
        </AuthShell>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}>
            <SignInContent />
        </Suspense>
    );
}
