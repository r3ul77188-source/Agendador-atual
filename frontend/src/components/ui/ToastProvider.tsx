import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { subscribeToasts, type ToastItem, type ToastVariant } from "../../lib/toast";
import { cn } from "../../lib/cn";

const variants: Record<
  ToastVariant,
  { icon: typeof Info; accent: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "bg-success",
    iconClass: "text-success bg-success/10 border-success/20",
  },
  error: {
    icon: AlertCircle,
    accent: "bg-danger",
    iconClass: "text-danger bg-danger/10 border-danger/20",
  },
  info: {
    icon: Info,
    accent: "bg-info",
    iconClass: "text-info bg-info/10 border-info/20",
  },
};

export function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((item) => {
      setItems((current) => [...current.slice(-3), item]);
      window.setTimeout(() => {
        setItems((current) => current.filter((toast) => toast.id !== item.id));
      }, 5500);
    });
  }, []);

  const dismiss = (id: string) =>
    setItems((current) => current.filter((toast) => toast.id !== id));

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((item) => {
        const meta = variants[item.variant];
        const Icon = meta.icon;

        return (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className="pointer-events-auto relative animate-toast-in overflow-hidden rounded-xl border border-line bg-surface/95 p-3.5 pl-4 shadow-2xl backdrop-blur-md"
          >
            <span className={cn("absolute inset-y-0 left-0 w-1", meta.accent)} aria-hidden="true" />
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  meta.iconClass,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="Fechar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="toast-progress absolute bottom-0 left-0 h-0.5 w-full bg-accent/40" />
          </div>
        );
      })}
    </div>
  );
}
