import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "../services/api";
import type { TaskRequest } from "../types/api";
import { toast } from "../lib/toast";

export const taskKeys = {
  all: ["tasks"] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: tasksService.list,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskRequest) => tasksService.create(payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Serviço cadastrado", `"${task.description}" está disponível.`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaskRequest }) =>
      tasksService.update(id, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Serviço atualizado", `"${task.description}" foi salvo.`);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Serviço removido", "O serviço foi excluído com sucesso.");
    },
  });
}
