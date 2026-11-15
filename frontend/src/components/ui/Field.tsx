import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1 text-[13px] font-medium text-text">
        <label htmlFor={htmlFor}>{label}</label>
        {required && (
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-xs text-danger" role="alert">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
