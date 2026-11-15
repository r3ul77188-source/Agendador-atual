import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface text-accent">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">Erro 404</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-text">Página não encontrada</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        O endereço acessado não existe ou foi movido. Volte para a visão geral e continue de onde
        parou.
      </p>
      <Link to="/" className="mt-6">
        <Button>Voltar para a visão geral</Button>
      </Link>
    </div>
  );
}
