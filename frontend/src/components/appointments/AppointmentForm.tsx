import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { CalendarClock, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input, Select, Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";
import {
  useCreateAppointment,
  useUpdateAppointment,
} from "../../hooks/useAppointments";
import { useClients } from "../../hooks/useClients";
import { useTasks } from "../../hooks/useTasks";
import { useWorkers } from "../../hooks/useWorkers";
import { STATUS_META, STATUS_OPTIONS } from "../../lib/constants";
import { applyApiFieldErrors } from "../../lib/formErrors";
import { buildApiMoment, splitApiMoment, todayInputValue } from "../../lib/format";
import { appointmentSchema, type AppointmentFormValues } from "../../lib/schemas";
import type { AppointmentResponse, StatusCode } from "../../types/api";

function nextSlot(): { date: string; time: string } {
  const next = new Date();
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
    time: `${pad(next.getHours())}:00`,
  };
}

function buildDefaults(appointment?: AppointmentResponse | null): AppointmentFormValues {
  if (!appointment) {
    const slot = nextSlot();
    return {
      description: "",
      date: slot.date,
      time: slot.time,
      status: "1",
      taskId: "",
      clientId: "",
      workerId: "",
    };
  }

  const { date, time } = splitApiMoment(appointment.moment);
  return {
    description: appointment.description,
    date,
    time,
    status: String(STATUS_META[appointment.status]?.code ?? 1) as AppointmentFormValues["status"],
    taskId: String(appointment.task.id),
    clientId: String(appointment.client.id),
    workerId: String(appointment.worker.id),
  };
}

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  appointment?: AppointmentResponse | null;
}

export function AppointmentForm({ open, onClose, appointment }: AppointmentFormProps) {
  const isEditing = Boolean(appointment);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const loading = createMutation.isPending || updateMutation.isPending;

  const clientsQuery = useClients();
  const workersQuery = useWorkers();
  const tasksQuery = useTasks();

  const clients = clientsQuery.data ?? [];
  const workers = workersQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const missing = {
    clients: !clientsQuery.isLoading && clients.length === 0,
    workers: !workersQuery.isLoading && workers.length === 0,
    tasks: !tasksQuery.isLoading && tasks.length === 0,
  };
  const hasMissing = missing.clients || missing.workers || missing.tasks;

  const schema = useMemo(() => appointmentSchema(isEditing), [isEditing]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(null),
  });

  useEffect(() => {
    if (!open) return;
    reset(buildDefaults(appointment));
  }, [open, appointment, reset]);

  const description = watch("description") ?? "";

  const onSubmit = async (values: AppointmentFormValues) => {
    const payload = {
      description: values.description,
      moment: buildApiMoment(values.date, values.time),
      status: Number(values.status) as StatusCode,
      taskId: Number(values.taskId),
      clientId: Number(values.clientId),
      workerId: Number(values.workerId),
    };

    try {
      if (appointment) {
        await updateMutation.mutateAsync({ id: appointment.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      applyApiFieldErrors(error, setError, { moment: "time" });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEditing ? "Editar agendamento" : "Novo agendamento"}
      title={isEditing ? "Editar agendamento" : "Agendar atendimento"}
      description="Vincule cliente, serviço e técnico. O sistema impede conflito de horário para o mesmo técnico."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="appointment-form" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar agendamento"}
          </Button>
        </>
      }
    >
      <form
        id="appointment-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Field
          label="Descrição do atendimento"
          htmlFor="appointment-description"
          required
          hint={`${description.length}/150 caracteres`}
          error={errors.description?.message}
        >
          <Textarea
            id="appointment-description"
            placeholder="Manutenção preventiva do ar-condicionado da sala 2"
            maxLength={150}
            invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Data" htmlFor="appointment-date" required error={errors.date?.message}>
            <Input
              id="appointment-date"
              type="date"
              min={isEditing ? undefined : todayInputValue()}
              invalid={Boolean(errors.date)}
              {...register("date")}
            />
          </Field>

          <Field label="Horário" htmlFor="appointment-time" required error={errors.time?.message}>
            <Input
              id="appointment-time"
              type="time"
              step={300}
              invalid={Boolean(errors.time)}
              {...register("time")}
            />
          </Field>

          <Field label="Status" htmlFor="appointment-status" required error={errors.status?.message}>
            <Select id="appointment-status" invalid={Boolean(errors.status)} {...register("status")}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Serviço"
          htmlFor="appointment-task"
          required
          error={errors.taskId?.message}
          hint={missing.tasks ? "Nenhum serviço cadastrado ainda." : undefined}
        >
          <Select
            id="appointment-task"
            invalid={Boolean(errors.taskId)}
            disabled={missing.tasks}
            {...register("taskId")}
          >
            <option value="">Selecione o serviço</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.description}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cliente"
            htmlFor="appointment-client"
            required
            error={errors.clientId?.message}
            hint={missing.clients ? "Nenhum cliente cadastrado ainda." : undefined}
          >
            <Select
              id="appointment-client"
              invalid={Boolean(errors.clientId)}
              disabled={missing.clients}
              {...register("clientId")}
            >
              <option value="">Selecione o cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.surname}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Técnico"
            htmlFor="appointment-worker"
            required
            error={errors.workerId?.message}
            hint={missing.workers ? "Nenhum técnico cadastrado ainda." : undefined}
          >
            <Select
              id="appointment-worker"
              invalid={Boolean(errors.workerId)}
              disabled={missing.workers}
              {...register("workerId")}
            >
              <option value="">Selecione o técnico</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} {worker.surname}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {hasMissing && (
          <div className="flex gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] p-3.5 text-xs leading-relaxed text-warning">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              Para criar um agendamento você precisa de pelo menos um{" "}
              {missing.clients && <Link to="/clientes" className="underline underline-offset-2">cliente</Link>}
              {missing.clients && (missing.workers || missing.tasks) ? ", um " : ""}
              {missing.workers && <Link to="/tecnicos" className="underline underline-offset-2">técnico</Link>}
              {missing.workers && missing.tasks ? " e um " : ""}
              {missing.tasks && <Link to="/servicos" className="underline underline-offset-2">serviço</Link>}{" "}
              cadastrado.
            </div>
          </div>
        )}

        <p className="flex items-center gap-2 text-[11px] text-muted">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          Horários no passado e conflitos com o mesmo técnico são bloqueados pela API.
        </p>
      </form>
    </Modal>
  );
}
