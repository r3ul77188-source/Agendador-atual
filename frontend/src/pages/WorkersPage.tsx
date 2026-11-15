import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, UserPlus, Wrench } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { WorkerForm } from "../components/workers/WorkerForm";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { IconButton } from "../components/ui/IconButton";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Input";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useDeleteWorker, useWorkers } from "../hooks/useWorkers";
import { useAppointments } from "../hooks/useAppointments";
import { useListControls } from "../hooks/useListControls";
import { useNovoParam } from "../hooks/useNovoParam";
import { normalize } from "../lib/format";
import type { WorkerSummary } from "../types/api";

const sortOptions = [
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "recent", label: "Cadastrados recentemente" },
  { value: "appointments-desc", label: "Mais agendamentos" },
];

export function WorkersPage() {
  const { data, isLoading, isError, error, refetch } = useWorkers();
  const { data: appointments } = useAppointments();
  const deleteMutation = useDeleteWorker();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkerSummary | null>(null);
  const [deleting, setDeleting] = useState<WorkerSummary | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  useNovoParam(openNew);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    (appointments ?? []).forEach((appointment) => {
      map.set(appointment.worker.id, (map.get(appointment.worker.id) ?? 0) + 1);
    });
    return map;
  }, [appointments]);

  const search = useCallback((worker: WorkerSummary, term: string) => {
    return normalize([worker.name, worker.surname].join(" ")).includes(term);
  }, []);

  const sorters = useMemo(
    () => ({
      "name-asc": (a: WorkerSummary, b: WorkerSummary) =>
        `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`, "pt-BR"),
      "name-desc": (a: WorkerSummary, b: WorkerSummary) =>
        `${b.name} ${b.surname}`.localeCompare(`${a.name} ${a.surname}`, "pt-BR"),
      recent: (a: WorkerSummary, b: WorkerSummary) => b.id - a.id,
      "appointments-desc": (a: WorkerSummary, b: WorkerSummary) =>
        (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0),
    }),
    [counts],
  );

  const controls = useListControls({
    items: data,
    search,
    sorters,
    initialSort: "name-asc",
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      /* erro exibido no toast global */
    }
  };

  const deletingCount = deleting ? (counts.get(deleting.id) ?? 0) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Equipe técnica"
        title="Técnicos"
        description="Profissionais responsáveis pelos atendimentos. Um técnico não pode ter dois agendamentos no mesmo horário."
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={openNew}>
            Novo técnico
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:p-4">
          <SearchInput
            value={controls.query}
            onChange={controls.setQuery}
            placeholder="Buscar técnico…"
            className="sm:max-w-md"
          />
          <Select
            aria-label="Ordenar técnicos"
            value={controls.sort}
            onChange={(event) => controls.setSort(event.target.value)}
            className="sm:ml-auto sm:w-[210px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-3 sm:p-4">
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : controls.filteredCount === 0 ? (
            <EmptyState
              icon={<Wrench className="h-6 w-6" />}
              title={controls.query ? "Nenhum técnico encontrado" : "Nenhum técnico cadastrado"}
              description={
                controls.query
                  ? "Tente buscar por outro nome ou sobrenome."
                  : "Cadastre a equipe técnica para distribuir os atendimentos."
              }
              action={
                controls.query ? (
                  <Button variant="secondary" size="sm" onClick={() => controls.setQuery("")}>
                    Limpar busca
                  </Button>
                ) : (
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
                    Cadastrar técnico
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                      <th className="px-3 py-2.5 font-medium">Técnico</th>
                      <th className="px-3 py-2.5 font-medium">Identificador</th>
                      <th className="px-3 py-2.5 font-medium">Agendamentos</th>
                      <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.pageItems.map((worker) => (
                      <tr
                        key={worker.id}
                        className="group border-t border-line/70 transition-colors hover:bg-surface-2/50"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={worker.name} surname={worker.surname} />
                            <p className="text-[13px] font-medium text-text">
                              {worker.name} {worker.surname}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-[12px] text-muted">
                          #{String(worker.id).padStart(3, "0")}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex min-w-8 justify-center rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text">
                            {counts.get(worker.id) ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-0.5">
                            <IconButton
                              label="Editar técnico"
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => {
                                setEditing(worker);
                                setFormOpen(true);
                              }}
                            />
                            <IconButton
                              label="Excluir técnico"
                              tone="danger"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleting(worker)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-2.5 sm:grid-cols-2 md:hidden">
                {controls.pageItems.map((worker) => (
                  <li
                    key={worker.id}
                    className="rounded-xl border border-line bg-surface-2/40 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={worker.name} surname={worker.surname} size="lg" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">
                            {worker.name} {worker.surname}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {counts.get(worker.id) ?? 0} agendamentos
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        <IconButton
                          label="Editar técnico"
                          icon={<Pencil className="h-4 w-4" />}
                          onClick={() => {
                            setEditing(worker);
                            setFormOpen(true);
                          }}
                        />
                        <IconButton
                          label="Excluir técnico"
                          tone="danger"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => setDeleting(worker)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
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
              itemLabel="técnicos"
            />
          </div>
        )}
      </section>

      <WorkerForm
        open={formOpen}
        worker={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Excluir técnico?"
        description={
          deleting
            ? `${deleting.name} ${deleting.surname} será removido permanentemente.${
                deletingCount > 0
                  ? ` Atenção: este técnico possui ${deletingCount} agendamento(s) e a API vai bloquear a exclusão até que eles sejam removidos.`
                  : ""
              }`
            : ""
        }
      />
    </>
  );
}
