import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  // User info (simplified for now, will integrate with auth later)
  userId: string | number | null;
  username: string | null;
  
  // Preferences
  theme: "light" | "dark" | "system";
  editorFontSize: number;
  
  // Actions
  setUser: (userId: string | number, username: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setEditorFontSize: (size: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // User info — populated after login via AuthContext
      userId: null,
      username: null,
      
      theme: "dark",
      editorFontSize: 14,
      
      setUser: (userId, username) => set({ userId, username }),
      
      setTheme: (theme) => set({ theme }),
      
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      
      logout: () => set({ userId: null, username: null }),
    }),
    {
      name: "algocrack-user-storage",
      partialize: (state) => ({
        theme: state.theme,
        editorFontSize: state.editorFontSize,
      }),
    }
  )
);
