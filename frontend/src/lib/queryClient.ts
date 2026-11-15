import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http";
import { toast } from "./toast";

/**
 * Cliente global do TanStack Query.
 * - Erros de mutação são avisados via toast (tratamento global).
 * - Erros de leitura aparecem nos estados de erro das páginas.
 * - Retry apenas para falhas de rede/5xx.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("[query]", error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível concluir a operação.";
      toast.error("Ação não concluída", message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.kind === "network") return failureCount < 1;
          if (error.status && error.status >= 500) return failureCount < 1;
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
