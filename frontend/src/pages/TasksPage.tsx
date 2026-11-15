import { useCallback, useMemo, useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { TaskForm } from "../components/tasks/TaskForm";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { IconButton } from "../components/ui/IconButton";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Input";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useDeleteTask, useTasks } from "../hooks/useTasks";
import { useAppointments } from "../hooks/useAppointments";
import { useListControls } from "../hooks/useListControls";
import { useNovoParam } from "../hooks/useNovoParam";
import { normalize } from "../lib/format";
import type { TaskSummary } from "../types/api";

const sortOptions = [
  { value: "description-asc", label: "Descrição (A–Z)" },
  { value: "description-desc", label: "Descrição (Z–A)" },
  { value: "recent", label: "Cadastrados recentemente" },
  { value: "appointments-desc", label: "Mais agendamentos" },
];

export function TasksPage() {
  const { data, isLoading, isError, error, refetch } = useTasks();
  const { data: appointments } = useAppointments();
  const deleteMutation = useDeleteTask();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskSummary | null>(null);
  const [deleting, setDeleting] = useState<TaskSummary | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  useNovoParam(openNew);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    (appointments ?? []).forEach((appointment) => {
      map.set(appointment.task.id, (map.get(appointment.task.id) ?? 0) + 1);
    });
    return map;
  }, [appointments]);

  const search = useCallback((task: TaskSummary, term: string) => {
    return normalize(task.description).includes(term);
  }, []);

  const sorters = useMemo(
    () => ({
      "description-asc": (a: TaskSummary, b: TaskSummary) =>
        a.description.localeCompare(b.description, "pt-BR"),
      "description-desc": (a: TaskSummary, b: TaskSummary) =>
        b.description.localeCompare(a.description, "pt-BR"),
      recent: (a: TaskSummary, b: TaskSummary) => b.id - a.id,
      "appointments-desc": (a: TaskSummary, b: TaskSummary) =>
        (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0),
    }),
    [counts],
  );

  const controls = useListControls({
    items: data,
    search,
    sorters,
    initialSort: "description-asc",
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
        eyebrow="Catálogo de serviços"
        title="Serviços"
        description="Tipos de atendimento que podem ser agendados. A descrição do serviço é única na base."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
            Novo serviço
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:p-4">
          <SearchInput
            value={controls.query}
            onChange={controls.setQuery}
            placeholder="Buscar serviço…"
            className="sm:max-w-md"
          />
          <Select
            aria-label="Ordenar serviços"
            value={controls.sort}
            onChange={(event) => controls.setSort(event.target.value)}
            className="sm:ml-auto sm:w-[220px]"
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
              icon={<ClipboardList className="h-6 w-6" />}
              title={controls.query ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
              description={
                controls.query
                  ? "Tente outro termo para encontrar o serviço desejado."
                  : "Cadastre os serviços oferecidos para usá-los nos agendamentos."
              }
              action={
                controls.query ? (
                  <Button variant="secondary" size="sm" onClick={() => controls.setQuery("")}>
                    Limpar busca
                  </Button>
                ) : (
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
                    Cadastrar serviço
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                      <th className="px-3 py-2.5 font-medium">Serviço</th>
                      <th className="px-3 py-2.5 font-medium">Agendamentos</th>
                      <th className="px-3 py-2.5 font-medium">Identificador</th>
                      <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.pageItems.map((task) => (
                      <tr
                        key={task.id}
                        className="group border-t border-line/70 transition-colors hover:bg-surface-2/50"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent">
                              <ClipboardList className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <p className="text-[13px] font-medium text-text">{task.description}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex min-w-8 justify-center rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text">
                            {counts.get(task.id) ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[12px] text-muted">
                          #{String(task.id).padStart(3, "0")}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-0.5">
                            <IconButton
                              label="Editar serviço"
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => {
                                setEditing(task);
                                setFormOpen(true);
                              }}
                            />
                            <IconButton
                              label="Excluir serviço"
                              tone="danger"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleting(task)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-2.5 md:hidden">
                {controls.pageItems.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-xl border border-line bg-surface-2/40 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-accent">
                          <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text">{task.description}</p>
                          <p className="mt-1 text-[11px] text-muted">
                            {counts.get(task.id) ?? 0} agendamentos
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <IconButton
                          label="Editar serviço"
                          icon={<Pencil className="h-4 w-4" />}
                          onClick={() => {
                            setEditing(task);
                            setFormOpen(true);
                          }}
                        />
                        <IconButton
                          label="Excluir serviço"
                          tone="danger"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => setDeleting(task)}
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
              itemLabel="serviços"
            />
          </div>
        )}
      </section>

      <TaskForm
        open={formOpen}
        task={editing}
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
        title="Excluir serviço?"
        description={
          deleting
            ? `"${deleting.description}" será removido permanentemente.${
                deletingCount > 0
                  ? ` Atenção: existem ${deletingCount} agendamento(s) usando este serviço. A API vai bloquear a exclusão até que eles sejam removidos.`
                  : ""
              }`
            : ""
        }
      />
    </>
  );
}
