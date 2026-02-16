"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { API_URLS } from "@/lib/constants";

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
        } catch (err: any) {
            // Parse error message if possible
            let msg = "Invalid credentials";
            if (err.message && err.message.includes("401")) msg = "Invalid email or password";
            else if (err.message) msg = err.message;
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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign in to AlgoCrack</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleManualLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        {/* For MVP we might not have a separate signup page or reuse signin for auto-provisioning if supported, 
                but let's assume standard signup flow or just direct them to signin for now */}
                        <Link href="/auth/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <SignInContent />
        </Suspense>
    );
}
