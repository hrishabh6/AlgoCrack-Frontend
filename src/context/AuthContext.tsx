"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { API_URLS } from "@/lib/constants";
import { useUserStore } from "@/store";

interface User {
    userId: string;
    email: string;
    role: string;
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
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded = parseJwt(storedToken);
                // Check expiration
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setToken(storedToken);
                    setUser(decoded);
                    // Sync with global store
                    useUserStore.getState().setUser(decoded.userId, decoded.sub || "");
                }
            } catch (e) {
                console.error("Invalid token:", e);
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        try {
            const decoded = parseJwt(newToken);
            setUser(decoded);
            // Sync with global store
            useUserStore.getState().setUser(decoded.userId, decoded.sub || "");
        } catch (e) {
            console.error("Failed to decode token during login:", e);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        // Sync with global store
        useUserStore.getState().logout();
        // router.push("/auth/signin"); // User requested no redirect on logout
    }, []);

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
    } catch (e) {
        throw new Error("Invalid Token");
    }
}
