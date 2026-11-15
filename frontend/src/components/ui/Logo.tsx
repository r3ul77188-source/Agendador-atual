import { cn } from "../../lib/cn";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7C877] to-[#D98B2B] shadow-[0_10px_24px_-12px_rgba(240,180,94,0.7)]">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <path
            d="M10 24V8h7a5.5 5.5 0 0 1 0 11h-4"
            fill="none"
            stroke="#1B1407"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="23" r="2.2" fill="#1B1407" />
        </svg>
      </span>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-[19px] font-semibold tracking-tight text-text">pauta</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            gestão de agenda
          </p>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7C877] to-[#D98B2B]",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="h-4 w-4" aria-hidden="true">
        <path
          d="M10 24V8h7a5.5 5.5 0 0 1 0 11h-4"
          fill="none"
          stroke="#1B1407"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="23" r="2.2" fill="#1B1407" />
      </svg>
    </span>
  );
}
