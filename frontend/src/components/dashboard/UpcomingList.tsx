import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/StatusBadge";
import { Skeleton } from "../ui/Skeleton";
import { dayLabel, formatTime, parseApiMoment } from "../../lib/format";
import type { AppointmentResponse } from "../../types/api";

interface UpcomingListProps {
  appointments: AppointmentResponse[];
  loading: boolean;
}

export function UpcomingList({ appointments, loading }: UpcomingListProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-text">Próximos 7 dias</h3>
          <p className="mt-0.5 text-[11px] text-muted">Atendimentos futuros em ordem cronológica</p>
        </div>
        <Link
          to="/agendamentos"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent transition hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Ver agenda
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="p-2 sm:p-3">
        {loading ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-text">Sem atendimentos nos próximos dias</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
              Quando novos agendamentos forem criados, eles aparecem aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line/70">
            {appointments.map((appointment) => {
              const date = parseApiMoment(appointment.moment);
              return (
                <li key={appointment.id}>
                  <Link
                    to={`/agendamentos?detalhe=${appointment.id}`}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-2">
                      <span className="font-mono text-[11px] font-semibold leading-none text-text">
                        {date ? formatTime(date) : "--:--"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-text">
                        {appointment.client.name} {appointment.client.surname}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {appointment.task.description} · {date ? dayLabel(date) : "—"}
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Avatar
                        name={appointment.worker.name}
                        surname={appointment.worker.surname}
                        size="sm"
                      />
                      <span className="max-w-[120px] truncate text-[11px] text-muted">
                        {appointment.worker.name}
                      </span>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
