import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock3,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { NextAppointmentCard } from "../components/dashboard/NextAppointmentCard";
import { StatusBreakdown } from "../components/dashboard/StatusBreakdown";
import { UpcomingList } from "../components/dashboard/UpcomingList";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { useAppointments } from "../hooks/useAppointments";
import { useClients } from "../hooks/useClients";
import { useTasks } from "../hooks/useTasks";
import { useWorkers } from "../hooks/useWorkers";
import { formatDateLong, isToday, parseApiMoment } from "../lib/format";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const quickActions = [
  {
    to: "/agendamentos?novo=1",
    label: "Novo agendamento",
    description: "Reserve um horário",
    icon: CalendarPlus,
  },
  {
    to: "/clientes?novo=1",
    label: "Novo cliente",
    description: "Adicione um contato",
    icon: UserPlus,
  },
  {
    to: "/tecnicos?novo=1",
    label: "Novo técnico",
    description: "Amplie a equipe",
    icon: Wrench,
  },
  {
    to: "/servicos?novo=1",
    label: "Novo serviço",
    description: "Cadastre um serviço",
    icon: ClipboardList,
  },
];

export function DashboardPage() {
  const appointmentsQuery = useAppointments();
  const clientsQuery = useClients();
  const workersQuery = useWorkers();
  const tasksQuery = useTasks();

  const appointments = appointmentsQuery.data ?? [];
  const loading =
    appointmentsQuery.isLoading ||
    clientsQuery.isLoading ||
    workersQuery.isLoading ||
    tasksQuery.isLoading;

  const hasError =
    appointmentsQuery.isError ||
    clientsQuery.isError ||
    workersQuery.isError ||
    tasksQuery.isError;

  const refetchAll = () => {
    void appointmentsQuery.refetch();
    void clientsQuery.refetch();
    void workersQuery.refetch();
    void tasksQuery.refetch();
  };

  const now = Date.now();
  const future = appointments
    .filter((appointment) => {
      const moment = parseApiMoment(appointment.moment);
      return moment ? moment.getTime() >= now : false;
    })
    .sort(
      (a, b) =>
        (parseApiMoment(a.moment)?.getTime() ?? 0) -
        (parseApiMoment(b.moment)?.getTime() ?? 0),
    );

  const next = future[0] ?? null;
  const todayCount = appointments.filter((appointment) => isToday(appointment.moment)).length;
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "PENDING",
  ).length;
  const weekAppointments = future.filter((appointment) => {
    const moment = parseApiMoment(appointment.moment);
    return moment ? moment.getTime() <= now + 7 * 86_400_000 : false;
  });

  return (
    <>
      <PageHeader
        eyebrow={`${greeting()} · ${formatDateLong(new Date())}`}
        title="Visão geral"
        description={
          loading
            ? "Carregando o panorama da operação…"
            : `${todayCount} ${todayCount === 1 ? "atendimento hoje" : "atendimentos hoje"} · ${pendingCount} ${pendingCount === 1 ? "pendente" : "pendentes"} na fila. Aqui está o pulso da sua operação.`
        }
        actions={
          <>
            <Link to="/agendamentos" className="hidden sm:block">
              <Button
                variant="secondary"
                leftIcon={<CalendarDays className="h-4 w-4" />}
              >
                Ver agenda
              </Button>
            </Link>
            <Link to="/agendamentos?novo=1">
              <Button leftIcon={<CalendarPlus className="h-4 w-4" />}>Novo agendamento</Button>
            </Link>
          </>
        }
      />

      {hasError ? (
        <ErrorState
          error={appointmentsQuery.error ?? clientsQuery.error ?? workersQuery.error}
          onRetry={refetchAll}
        />
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Agendamentos"
              value={appointments.length}
              hint={`${todayCount} hoje`}
              icon={<CalendarDays className="h-5 w-5" />}
              tone="accent"
              loading={loading}
            />
            <StatCard
              label="Próximos"
              value={future.length}
              hint="A partir de agora"
              icon={<Clock3 className="h-5 w-5" />}
              tone="info"
              loading={loading}
            />
            <StatCard
              label="Clientes"
              value={clientsQuery.data?.length ?? 0}
              hint="Contatos na base"
              icon={<Users className="h-5 w-5" />}
              tone="success"
              loading={loading}
            />
            <StatCard
              label="Técnicos"
              value={workersQuery.data?.length ?? 0}
              hint={`${tasksQuery.data?.length ?? 0} serviços no catálogo`}
              icon={<Wrench className="h-5 w-5" />}
              tone="warning"
              loading={loading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <NextAppointmentCard appointment={next} loading={loading} />
            </div>
            <StatusBreakdown appointments={appointments} loading={loading} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UpcomingList appointments={weekAppointments.slice(0, 6)} loading={loading} />
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="font-display text-sm font-semibold text-text">Ações rápidas</h3>
              <p className="mt-0.5 text-[11px] text-muted">Atalhos para o dia a dia</p>

              <div className="mt-4 space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-all hover:border-accent/30 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-accent">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-text">
                          {action.label}
                        </span>
                        <span className="block text-[11px] text-muted">{action.description}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-line pt-4">
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="rounded-xl border border-accent/15 bg-accent/[0.04] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                      Serviços
                    </p>
                    <p className="mt-1.5 text-[13px] text-text">
                      {tasksQuery.data?.length ?? 0} tipos cadastrados
                    </p>
                    <Link
                      to="/servicos"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
                    >
                      Gerenciar catálogo
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="hidden">
              <Skeleton />
            </div>
          )}
        </div>
      )}
    </>
  );
}
