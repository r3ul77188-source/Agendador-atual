import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "../services/api";
import type { ClientRequest } from "../types/api";
import { toast } from "../lib/toast";

export const clientKeys = {
  all: ["clients"] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.all,
    queryFn: clientsService.list,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientRequest) => clientsService.create(payload),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente cadastrado", `${client.name} ${client.surname} entrou na base.`);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClientRequest }) =>
      clientsService.update(id, payload),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cliente atualizado", `Os dados de ${client.name} foram salvos.`);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente removido", "O cadastro foi excluído com sucesso.");
    },
  });
}
