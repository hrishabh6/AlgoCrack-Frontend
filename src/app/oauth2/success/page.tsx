"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const next = searchParams.get("next") || "/";

    if (token) {
      // Successful login
      login(token);

      // Clear URL params and redirect to next or home
      router.replace(next);
    } else if (error) {
      // Handle error case
      router.replace(`/auth/signin?error=${encodeURIComponent(error)}`);
    } else {
      // Fallback if accessed directly
      router.replace("/auth/signin");
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Completing secure sign-in...</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <OAuthSuccessContent />
    </Suspense>
  );
}
