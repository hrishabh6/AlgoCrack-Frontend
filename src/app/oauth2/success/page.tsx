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
    <div className="flex min-h-[calc(100dvh-3rem-73px)] flex-col items-center justify-center gap-3" role="status">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Completing secure sign-in…</p>
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
