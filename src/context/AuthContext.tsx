"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useUserStore } from "@/store";

interface User {
    userId: string;
    email: string;
    role: string;
    name?: string;
    imgUrl?: string;
    sub?: string; // JWT subject (email)
    exp?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        // Sync with global store
        useUserStore.getState().logout();
        // router.push("/auth/signin"); // User requested no redirect on logout
    }, []);

    const hydrateUserProfile = useCallback(async (userId: string) => {
        try {
            const profile = await apiClient.get<{ userDetails?: { name?: string; imgUrl?: string } }>(
                `/api/v1/user/profile/${encodeURIComponent(userId)}?page=0&size=1`
            );
            const details = profile?.userDetails;
            if (!details) return;

            setUser((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    name: details.name ?? prev.name,
                    imgUrl: details.imgUrl ?? prev.imgUrl,
                };
            });
        } catch {
            // Profile hydration is best-effort; keep auth state even if this fails.
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const finishLoading = () => {
            queueMicrotask(() => {
                if (!cancelled) setIsLoading(false);
            });
        };

        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            useUserStore.getState().logout();
            finishLoading();
            return () => {
                cancelled = true;
            };
        }

        try {
            const decoded = parseJwt(storedToken);
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                useUserStore.getState().logout();
                finishLoading();
                return () => {
                    cancelled = true;
                };
            }

            queueMicrotask(() => {
                if (cancelled) return;
                setToken(storedToken);
                setUser(decoded);
                setIsLoading(false);
            });
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem("token");
            useUserStore.getState().logout();
            finishLoading();
        }

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!user?.userId) {
            useUserStore.getState().logout();
            return;
        }
        useUserStore.getState().setUser(user.userId, user.sub || "");
    }, [user?.userId, user?.sub]);

    const login = useCallback((newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        try {
            const decoded = parseJwt(newToken);
            setUser(decoded);
            if (decoded.userId) {
                void hydrateUserProfile(decoded.userId);
            }
            // Sync with global store
            useUserStore.getState().setUser(decoded.userId, decoded.sub || "");
        } catch (e) {
            console.error("Failed to decode token during login:", e);
        }
    }, [hydrateUserProfile]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Helper to decode JWT without external library
function parseJwt(token: string): User {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);

        // Map standard JWT claims to our User interface if needed
        // Our backend likely provides userId, role in the payload
        return {
            userId: decoded.userId || decoded.sub, // Fallback
            email: decoded.sub,
            role: decoded.role || "USER",
            ...decoded
        };
    } catch {
        throw new Error("Invalid Token");
    }
}
