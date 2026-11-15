import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workersService } from "../services/api";
import type { WorkerRequest } from "../types/api";
import { toast } from "../lib/toast";

export const workerKeys = {
  all: ["workers"] as const,
};

export function useWorkers() {
  return useQuery({
    queryKey: workerKeys.all,
    queryFn: workersService.list,
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkerRequest) => workersService.create(payload),
    onSuccess: (worker) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast.success("Técnico cadastrado", `${worker.name} ${worker.surname} está disponível.`);
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WorkerRequest }) =>
      workersService.update(id, payload),
    onSuccess: (worker) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Técnico atualizado", `Os dados de ${worker.name} foram salvos.`);
    },
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast.success("Técnico removido", "O cadastro foi excluído com sucesso.");
    },
  });
}
