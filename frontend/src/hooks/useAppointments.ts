import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../services/api";
import type { AppointmentRequest } from "../types/api";
import { toast } from "../lib/toast";

export const appointmentKeys = {
  all: ["appointments"] as const,
};

export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.all,
    queryFn: appointmentsService.list,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppointmentRequest) => appointmentsService.create(payload),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success(
        "Agendamento criado",
        `${appointment.client.name} · ${appointment.moment}`,
      );
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AppointmentRequest }) =>
      appointmentsService.update(id, payload),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success("Agendamento atualizado", `Horário: ${appointment.moment}`);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success("Agendamento removido", "O horário foi liberado na agenda.");
    },
  });
}
