import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Skeleton } from "../ui/Skeleton";

type Tone = "accent" | "warning" | "info" | "success";

const tones: Record<Tone, { icon: string; glow: string }> = {
  accent: { icon: "bg-accent/10 text-accent border-accent/20", glow: "from-accent/[0.07]" },
  warning: { icon: "bg-warning/10 text-warning border-warning/20", glow: "from-warning/[0.07]" },
  info: { icon: "bg-info/10 text-info border-info/20", glow: "from-info/[0.07]" },
  success: { icon: "bg-success/10 text-success border-success/20", glow: "from-success/[0.07]" },
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint: string;
  icon: ReactNode;
  tone?: Tone;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "accent",
  loading,
  onClick,
}: StatCardProps) {
  const meta = tones[tone];
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left sm:p-5",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]",
        onClick && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          meta.glow,
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            meta.icon,
          )}
        >
          {icon}
        </span>
        {onClick && (
          <ArrowUpRight className="h-4 w-4 text-muted/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        )}
      </div>

      <div className="relative mt-5">
        {loading ? (
          <Skeleton className="h-7 w-14 sm:h-8 sm:w-16" />
        ) : (
          <p className="font-display text-2xl font-semibold leading-none tracking-tight text-text sm:text-[30px]">
            {value}
          </p>
        )}
        <p className="mt-2 text-[13px] font-medium text-text/90">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
    </Wrapper>
  );
}
