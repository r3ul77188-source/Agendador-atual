export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();

/** Barramento simples de toasts: permite disparar avisos de qualquer camada. */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(variant: ToastVariant, title: string, description?: string) {
  const item: ToastItem = {
    id: crypto.randomUUID(),
    title,
    description,
    variant,
  };
  listeners.forEach((listener) => listener(item));
}

export const toast = {
  success: (title: string, description?: string) => emit("success", title, description),
  error: (title: string, description?: string) => emit("error", title, description),
  info: (title: string, description?: string) => emit("info", title, description),
};
