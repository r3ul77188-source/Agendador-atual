import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CalendarPlus,
  Eye,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { AppointmentForm } from "../components/appointments/AppointmentForm";
import { AppointmentDetails } from "../components/appointments/AppointmentDetails";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { IconButton } from "../components/ui/IconButton";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Avatar } from "../components/ui/Avatar";
import { useAppointments, useDeleteAppointment } from "../hooks/useAppointments";
import { useListControls } from "../hooks/useListControls";
import { STATUS_META, STATUS_ORDER } from "../lib/constants";
import {
  dayLabel,
  formatPhone,
  formatTime,
  normalize,
  parseApiMoment,
} from "../lib/format";
import type { AppointmentResponse, Status } from "../types/api";

type PeriodFilter = "all" | "upcoming" | "today" | "week" | "past";

const periodOptions: Array<{ value: PeriodFilter; label: string }> = [
  { value: "all", label: "Todos os períodos" },
  { value: "upcoming", label: "Próximos" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Próximos 7 dias" },
  { value: "past", label: "Passados" },
];

const sortOptions = [
  { value: "proximos", label: "Próximos primeiro" },
  { value: "moment-asc", label: "Data (mais antiga)" },
  { value: "moment-desc", label: "Data (mais recente)" },
  { value: "client-asc", label: "Cliente (A–Z)" },
  { value: "recent", label: "Criados recentemente" },
];

function matchesPeriod(appointment: AppointmentResponse, period: PeriodFilter): boolean {
  const moment = parseApiMoment(appointment.moment);
  if (!moment) return false;
  const now = Date.now();
  const time = moment.getTime();

  switch (period) {
    case "upcoming":
      return time >= now;
    case "past":
      return time < now;
    case "today": {
      const today = new Date();
      return (
        moment.getDate() === today.getDate() &&
        moment.getMonth() === today.getMonth() &&
        moment.getFullYear() === today.getFullYear()
      );
    }
    case "week":
      return time >= now && time <= now + 7 * 86_400_000;
    default:
      return true;
  }
}

export function AppointmentsPage() {
  const { data, isLoading, isError, error, refetch } = useAppointments();
  const deleteMutation = useDeleteAppointment();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [formState, setFormState] = useState<{
    open: boolean;
    appointment: AppointmentResponse | null;
  }>({ open: false, appointment: null });
  const [deleting, setDeleting] = useState<AppointmentResponse | null>(null);

  const detailId = searchParams.get("detalhe");
  const detail = useMemo(
    () => data?.find((appointment) => String(appointment.id) === detailId) ?? null,
    [data, detailId],
  );

  // Atalho vindo do dashboard: /agendamentos?novo=1
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      setFormState({ open: true, appointment: null });
      const next = new URLSearchParams(searchParams);
      next.delete("novo");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openDetails = (appointment: AppointmentResponse) => {
    const next = new URLSearchParams(searchParams);
    next.set("detalhe", String(appointment.id));
    setSearchParams(next, { replace: true });
  };

  const closeDetails = () => {
    if (!searchParams.has("detalhe")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("detalhe");
    setSearchParams(next, { replace: true });
  };

  const startEdit = (appointment: AppointmentResponse) => {
    closeDetails();
    setFormState({ open: true, appointment });
  };

  const preFiltered = useMemo(() => {
    return (data ?? []).filter((appointment) => {
      const statusOk = statusFilter === "all" || appointment.status === statusFilter;
      return statusOk && matchesPeriod(appointment, periodFilter);
    });
  }, [data, statusFilter, periodFilter]);

  const search = useCallback((appointment: AppointmentResponse, term: string) => {
    const haystack = normalize(
      [
        appointment.description,
        appointment.client.name,
        appointment.client.surname,
        appointment.client.cellphone,
        appointment.client.address,
        appointment.worker.name,
        appointment.worker.surname,
        appointment.task.description,
        STATUS_META[appointment.status]?.label ?? "",
        appointment.moment,
      ].join(" "),
    );
    return haystack.includes(term);
  }, []);

  const sorters = useMemo(
    () => ({
      proximos: (a: AppointmentResponse, b: AppointmentResponse) => {
        const now = Date.now();
        const aTime = parseApiMoment(a.moment)?.getTime() ?? 0;
        const bTime = parseApiMoment(b.moment)?.getTime() ?? 0;
        const aFuture = aTime >= now;
        const bFuture = bTime >= now;
        if (aFuture && bFuture) return aTime - bTime;
        if (!aFuture && !bFuture) return bTime - aTime;
        return aFuture ? -1 : 1;
      },
      "moment-asc": (a: AppointmentResponse, b: AppointmentResponse) =>
        (parseApiMoment(a.moment)?.getTime() ?? 0) - (parseApiMoment(b.moment)?.getTime() ?? 0),
      "moment-desc": (a: AppointmentResponse, b: AppointmentResponse) =>
        (parseApiMoment(b.moment)?.getTime() ?? 0) - (parseApiMoment(a.moment)?.getTime() ?? 0),
      "client-asc": (a: AppointmentResponse, b: AppointmentResponse) =>
        `${a.client.name} ${a.client.surname}`.localeCompare(
          `${b.client.name} ${b.client.surname}`,
          "pt-BR",
        ),
      recent: (a: AppointmentResponse, b: AppointmentResponse) => b.id - a.id,
    }),
    [],
  );

  const controls = useListControls({
    items: preFiltered,
    search,
    sorters,
    initialSort: "proximos",
  });

  useEffect(() => {
    controls.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, periodFilter]);

  const hasFilters =
    controls.query.trim().length > 0 || statusFilter !== "all" || periodFilter !== "all";

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      /* toast global cuida do erro */
    }
  };

  const upcomingCount = (data ?? []).filter((appointment) => {
    const moment = parseApiMoment(appointment.moment);
    return moment ? moment.getTime() >= Date.now() : false;
  }).length;

  return (
    <>
      <PageHeader
        eyebrow="Agenda operacional"
        title="Agendamentos"
        description={`${data?.length ?? 0} agendamentos na base · ${upcomingCount} futuros. Filtre por status, período ou busque por cliente, técnico e serviço.`}
        actions={
          <Button
            leftIcon={<CalendarPlus className="h-4 w-4" />}
            onClick={() => setFormState({ open: true, appointment: null })}
          >
            Novo agendamento
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:p-4">
          <SearchInput
            value={controls.query}
            onChange={controls.setQuery}
            placeholder="Buscar agendamento…"
            className="sm:max-w-md"
          />

          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:items-center">
            <Select
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | Status)}
              className="sm:w-[168px]"
            >
              <option value="all">Todos os status</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filtrar por período"
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              className="sm:w-[178px]"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Ordenar"
              value={controls.sort}
              onChange={(event) => controls.setSort(event.target.value)}
              className="col-span-2 sm:w-[190px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {isLoading ? (
            <TableSkeleton rows={7} />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : controls.filteredCount === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title={hasFilters ? "Nenhum agendamento encontrado" : "Sua agenda está vazia"}
              description={
                hasFilters
                  ? "Ajuste a busca ou os filtros para encontrar outros agendamentos."
                  : "Crie o primeiro agendamento vinculando um cliente, um serviço e um técnico."
              }
              action={
                hasFilters ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      controls.setQuery("");
                      setStatusFilter("all");
                      setPeriodFilter("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    leftIcon={<CalendarPlus className="h-4 w-4" />}
                    onClick={() => setFormState({ open: true, appointment: null })}
                  >
                    Criar agendamento
                  </Button>
                )
              }
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                      <th className="px-3 py-2.5 font-medium">Horário</th>
                      <th className="px-3 py-2.5 font-medium">Cliente</th>
                      <th className="px-3 py-2.5 font-medium">Serviço</th>
                      <th className="px-3 py-2.5 font-medium">Técnico</th>
                      <th className="px-3 py-2.5 font-medium">Status</th>
                      <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.pageItems.map((appointment) => {
                      const date = parseApiMoment(appointment.moment);
                      return (
                        <tr
                          key={appointment.id}
                          className="group border-t border-line/70 transition-colors hover:bg-surface-2/50"
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-2">
                                <span className="font-mono text-[11px] font-semibold leading-none text-text">
                                  {date ? formatTime(date) : "--:--"}
                                </span>
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-text">
                                  {date ? dayLabel(date) : "—"}
                                </p>
                                <p className="text-[11px] text-muted">
                                  {date
                                    ? new Intl.DateTimeFormat("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }).format(date)
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                name={appointment.client.name}
                                surname={appointment.client.surname}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-text">
                                  {appointment.client.name} {appointment.client.surname}
                                </p>
                                <p className="text-[11px] text-muted">
                                  {formatPhone(appointment.client.cellphone)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[320px] px-3 py-3">
                            <p className="truncate text-[13px] text-text">
                              {appointment.task.description}
                            </p>
                            <p className="truncate text-[11px] text-muted">
                              {appointment.description}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="truncate text-[13px] text-text">
                              {appointment.worker.name} {appointment.worker.surname}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={appointment.status} />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconButton
                                label="Ver detalhes"
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => openDetails(appointment)}
                              />
                              <IconButton
                                label="Editar agendamento"
                                icon={<Pencil className="h-4 w-4" />}
                                onClick={() =>
                                  setFormState({ open: true, appointment })
                                }
                              />
                              <IconButton
                                label="Excluir agendamento"
                                tone="danger"
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => setDeleting(appointment)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <ul className="space-y-2.5 md:hidden">
                {controls.pageItems.map((appointment) => {
                  const date = parseApiMoment(appointment.moment);
                  return (
                    <li
                      key={appointment.id}
                      className="rounded-xl border border-line bg-surface-2/40 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                            <span className="font-mono text-[11px] font-semibold leading-none text-accent">
                              {date ? formatTime(date) : "--:--"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text">
                              {appointment.client.name} {appointment.client.surname}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {date ? dayLabel(date) : "—"} ·{" "}
                              {appointment.worker.name} {appointment.worker.surname}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                        <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{appointment.task.description}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2">
                        <button
                          type="button"
                          onClick={() => openDetails(appointment)}
                          className="text-xs font-medium text-accent hover:underline underline-offset-2"
                        >
                          Ver detalhes
                        </button>
                        <div className="flex gap-0.5">
                          <IconButton
                            label="Editar agendamento"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => setFormState({ open: true, appointment })}
                          />
                          <IconButton
                            label="Excluir agendamento"
                            tone="danger"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => setDeleting(appointment)}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {!isLoading && !isError && controls.filteredCount > 0 && (
          <div className="border-t border-line px-3 py-3 sm:px-4">
            <Pagination
              page={controls.page}
              totalPages={controls.totalPages}
              total={controls.filteredCount}
              pageSize={controls.pageSize}
              onPageChange={controls.setPage}
              itemLabel="agendamentos"
            />
          </div>
        )}
      </section>

      <AppointmentForm
        open={formState.open}
        appointment={formState.appointment}
        onClose={() => setFormState({ open: false, appointment: null })}
      />

      <AppointmentDetails
        appointment={detail}
        onClose={closeDetails}
        onEdit={startEdit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Excluir agendamento?"
        description={
          deleting
            ? `O agendamento de ${deleting.client.name} ${deleting.client.surname} em ${deleting.moment} será removido e o horário ficará livre. Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </>
  );
}
