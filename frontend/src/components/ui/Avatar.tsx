import { cn } from "../../lib/cn";
import { initials } from "../../lib/format";

interface AvatarProps {
  name: string;
  surname?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({ name, surname, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-semibold uppercase tracking-wide text-accent",
        sizes[size],
        className,
      )}
    >
      {initials(name, surname)}
    </span>
  );
}
