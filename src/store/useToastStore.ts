import { create } from "zustand";

export type ToastTone = "default" | "success" | "error";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id" | "tone"> & { tone?: ToastTone }) => number;
  dismiss: (id: number) => void;
}

const DURATION_MS = 4000;
const MAX_VISIBLE = 4;
let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: ({ tone = "default", ...toast }) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, tone, ...toast }].slice(-MAX_VISIBLE) }));
    setTimeout(() => get().dismiss(id), DURATION_MS);
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative helpers usable outside React components (e.g. inside store actions). */
export const toast = {
  show: (title: string, description?: string) => useToastStore.getState().push({ title, description }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "error" }),
};
