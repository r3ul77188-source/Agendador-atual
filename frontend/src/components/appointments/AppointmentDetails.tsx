import { CalendarDays, Clock, MapPin, Phone, User, Wrench } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";
import { Avatar } from "../ui/Avatar";
import { formatPhone, parseApiMoment, dayLabel, formatTime } from "../../lib/format";
import type { AppointmentResponse } from "../../types/api";

interface AppointmentDetailsProps {
  appointment: AppointmentResponse | null;
  onClose: () => void;
  onEdit: (appointment: AppointmentResponse) => void;
}

export function AppointmentDetails({ appointment, onClose, onEdit }: AppointmentDetailsProps) {
  const date = appointment ? parseApiMoment(appointment.moment) : null;

  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      eyebrow="Detalhes do agendamento"
      title={appointment?.description ?? "Agendamento"}
      description={appointment ? `#${appointment.id} · criado na agenda` : undefined}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {appointment && (
            <Button onClick={() => onEdit(appointment)} leftIcon={<CalendarDays className="h-4 w-4" />}>
              Editar agendamento
            </Button>
          )}
        </>
      }
    >
      {appointment && date && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-2/60 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <span className="font-mono text-lg font-semibold leading-none">
                  {formatTime(date)}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">
                  {dayLabel(date)}
                </span>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[13px] text-text">
                  <CalendarDays className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(date)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatTime(date)} · horário local
                </p>
              </div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <User className="h-3.5 w-3.5" aria-hidden="true" /> Cliente
              </dt>
              <dd className="mt-2 flex items-center gap-2.5">
                <Avatar name={appointment.client.name} surname={appointment.client.surname} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {appointment.client.name} {appointment.client.surname}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <Phone className="h-3 w-3" aria-hidden="true" />
                    {formatPhone(appointment.client.cellphone)}
                  </p>
                </div>
              </dd>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> Técnico
              </dt>
              <dd className="mt-2 flex items-center gap-2.5">
                <Avatar name={appointment.worker.name} surname={appointment.worker.surname} size="sm" />
                <p className="truncate text-sm font-medium text-text">
                  {appointment.worker.name} {appointment.worker.surname}
                </p>
              </dd>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Serviço
              </dt>
              <dd className="mt-1.5 text-sm text-text">{appointment.task.description}</dd>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Endereço do atendimento
              </dt>
              <dd className="mt-1.5 text-sm text-text">{appointment.client.address}</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
}
