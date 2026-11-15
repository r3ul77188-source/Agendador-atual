import { STATUS_META, STATUS_ORDER } from "../../lib/constants";
import type { AppointmentResponse } from "../../types/api";
import { Skeleton } from "../ui/Skeleton";

export function StatusBreakdown({
  appointments,
  loading,
}: {
  appointments: AppointmentResponse[];
  loading: boolean;
}) {
  const total = appointments.length;
  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: appointments.filter((appointment) => appointment.status === status).length,
  }));

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-5 h-2.5 w-full" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-text">Status da agenda</h3>
        <span className="font-mono text-xs text-muted">{total} total</span>
      </div>

      <div
        className="mt-5 flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={counts
          .map(({ status, count }) => `${STATUS_META[status].label}: ${count}`)
          .join(", ")}
      >
        {total === 0 ? (
          <span className="h-full w-full rounded-full bg-surface-3" />
        ) : (
          counts.map(({ status, count }) =>
            count > 0 ? (
              <span
                key={status}
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: STATUS_META[status].dot,
                }}
              />
            ) : null,
          )
        )}
      </div>

      <ul className="mt-5 flex-1 space-y-3.5">
        {counts.map(({ status, count }) => {
          const percent = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <li key={status} className="flex items-center gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_META[status].dot }}
                aria-hidden="true"
              />
              <span className="flex-1 text-[13px] text-muted">{STATUS_META[status].label}</span>
              <span className="font-mono text-[12px] text-text">{count}</span>
              <span className="w-9 text-right font-mono text-[11px] text-muted">{percent}%</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
        Distribuição de todos os agendamentos cadastrados.
      </p>
    </div>
  );
}
