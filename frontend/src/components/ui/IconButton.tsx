import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  tone?: "default" | "danger";
}

export function IconButton({ label, icon, tone = "default", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition-all",
        "hover:border-line hover:bg-surface-2 hover:text-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        tone === "danger" && "hover:border-danger/30 hover:bg-danger/10 hover:text-danger",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
