import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck2, CalendarPlus, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { Avatar } from "../ui/Avatar";
import { Skeleton } from "../ui/Skeleton";
import { dayLabel, formatTime, parseApiMoment } from "../../lib/format";
import type { AppointmentResponse } from "../../types/api";

interface NextAppointmentCardProps {
  appointment: AppointmentResponse | null;
  loading: boolean;
}

export function NextAppointmentCard({ appointment, loading }: NextAppointmentCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <Skeleton className="h-3 w-32" />
        <div className="mt-5 flex gap-5">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3.5 w-2/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-surface/60 p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
          <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold text-text">
          Nenhum atendimento futuro
        </h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
          A agenda está livre. Crie um agendamento para reservar o primeiro horário da equipe.
        </p>
        <div className="mt-5">
          <Link to="/agendamentos?novo=1">
            <Button size="sm" leftIcon={<CalendarPlus className="h-4 w-4" />}>
              Criar agendamento
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const date = parseApiMoment(appointment.moment);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-surface p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/[0.12] blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          Próximo atendimento
        </p>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="relative mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.08]">
          <span className="font-mono text-2xl font-semibold leading-none text-accent">
            {date ? formatTime(date) : "--:--"}
          </span>
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-accent/80">
            {date ? dayLabel(date) : "—"}
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-muted">
            {date
              ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date)
              : ""}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-text">
            {appointment.description}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {appointment.task.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2.5">
              <Avatar
                name={appointment.client.name}
                surname={appointment.client.surname}
                size="sm"
              />
              <div>
                <p className="text-[11px] text-muted">Cliente</p>
                <p className="text-[13px] font-medium text-text">
                  {appointment.client.name} {appointment.client.surname}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Avatar
                name={appointment.worker.name}
                surname={appointment.worker.surname}
                size="sm"
              />
              <div>
                <p className="text-[11px] text-muted">Técnico</p>
                <p className="text-[13px] font-medium text-text">
                  {appointment.worker.name} {appointment.worker.surname}
                </p>
              </div>
            </div>
          </div>

          <Link
            to={`/agendamentos?detalhe=${appointment.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Ver detalhes do atendimento
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
