"use client";

import { useUserStore } from "@/store";

export default function ProfilePage() {
    const { username } = useUserStore();

    return (
        <div className="w-full px-4 py-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="mt-2 text-muted-foreground">
                Welcome, {username || "Guest"}!
            </p>
            {/* TODO: Implement profile page */}
            <div className="mt-8 rounded-lg border bg-muted/30 p-12 text-center">
                <p className="text-muted-foreground">Profile page coming soon...</p>
            </div>
        </div>
    );
}
