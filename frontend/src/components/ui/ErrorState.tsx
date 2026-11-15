import { CloudOff, RefreshCw } from "lucide-react";
import { ApiError } from "../../lib/http";
import { Button } from "./Button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const apiError = error instanceof ApiError ? error : null;

  return (
    <div
      className={
        "flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger/[0.04] px-6 py-14 text-center " +
        (className ?? "")
      }
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/25 bg-danger/10 text-danger">
        <CloudOff className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-text">
        Não foi possível carregar os dados
      </h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
        {apiError?.message ?? "Ocorreu um erro inesperado ao falar com a API."}
      </p>
      {apiError?.kind === "network" && (
        <p className="mt-2 max-w-md text-xs text-muted/80">
          Dica: confira se o back-end está rodando e se a URL em <code>.env</code> está correta.
        </p>
      )}
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
