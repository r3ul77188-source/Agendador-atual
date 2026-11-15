import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { ClientForm } from "../components/clients/ClientForm";
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
import { useClients, useDeleteClient } from "../hooks/useClients";
import { useAppointments } from "../hooks/useAppointments";
import { useListControls } from "../hooks/useListControls";
import { useNovoParam } from "../hooks/useNovoParam";
import { formatPhone, normalize } from "../lib/format";
import type { ClientSummary } from "../types/api";

const sortOptions = [
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "recent", label: "Cadastrados recentemente" },
  { value: "appointments-desc", label: "Mais agendamentos" },
];

export function ClientsPage() {
  const { data, isLoading, isError, error, refetch } = useClients();
  const { data: appointments } = useAppointments();
  const deleteMutation = useDeleteClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientSummary | null>(null);
  const [deleting, setDeleting] = useState<ClientSummary | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  useNovoParam(openNew);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    (appointments ?? []).forEach((appointment) => {
      map.set(appointment.client.id, (map.get(appointment.client.id) ?? 0) + 1);
    });
    return map;
  }, [appointments]);

  const search = useCallback((client: ClientSummary, term: string) => {
    return normalize(
      [client.name, client.surname, client.cellphone, client.address].join(" "),
    ).includes(term);
  }, []);

  const sorters = useMemo(
    () => ({
      "name-asc": (a: ClientSummary, b: ClientSummary) =>
        `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`, "pt-BR"),
      "name-desc": (a: ClientSummary, b: ClientSummary) =>
        `${b.name} ${b.surname}`.localeCompare(`${a.name} ${a.surname}`, "pt-BR"),
      recent: (a: ClientSummary, b: ClientSummary) => b.id - a.id,
      "appointments-desc": (a: ClientSummary, b: ClientSummary) =>
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
        eyebrow="Base de clientes"
        title="Clientes"
        description="Cadastros de contato e endereço usados nos agendamentos. Telefone e endereço são únicos na base."
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={openNew}>
            Novo cliente
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:p-4">
          <SearchInput
            value={controls.query}
            onChange={controls.setQuery}
            placeholder="Buscar cliente…"
            className="sm:max-w-md"
          />
          <Select
            aria-label="Ordenar clientes"
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
              icon={<Users className="h-6 w-6" />}
              title={controls.query ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              description={
                controls.query
                  ? "Tente outro nome, telefone ou trecho do endereço."
                  : "Cadastre o primeiro cliente para poder criar agendamentos."
              }
              action={
                controls.query ? (
                  <Button variant="secondary" size="sm" onClick={() => controls.setQuery("")}>
                    Limpar busca
                  </Button>
                ) : (
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
                    Cadastrar cliente
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                      <th className="px-3 py-2.5 font-medium">Cliente</th>
                      <th className="px-3 py-2.5 font-medium">Celular</th>
                      <th className="px-3 py-2.5 font-medium">Endereço</th>
                      <th className="px-3 py-2.5 font-medium">Agendamentos</th>
                      <th className="px-3 py-2.5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.pageItems.map((client) => (
                      <tr
                        key={client.id}
                        className="group border-t border-line/70 transition-colors hover:bg-surface-2/50"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={client.name} surname={client.surname} />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-text">
                                {client.name} {client.surname}
                              </p>
                              <p className="text-[11px] text-muted">#{client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono text-[12px] text-text">
                          {formatPhone(client.cellphone)}
                        </td>
                        <td className="max-w-[320px] px-3 py-3">
                          <p className="truncate text-[13px] text-muted" title={client.address}>
                            {client.address}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex min-w-8 justify-center rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text">
                            {counts.get(client.id) ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-0.5">
                            <IconButton
                              label="Editar cliente"
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => {
                                setEditing(client);
                                setFormOpen(true);
                              }}
                            />
                            <IconButton
                              label="Excluir cliente"
                              tone="danger"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setDeleting(client)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-2.5 md:hidden">
                {controls.pageItems.map((client) => (
                  <li
                    key={client.id}
                    className="rounded-xl border border-line bg-surface-2/40 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={client.name} surname={client.surname} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">
                            {client.name} {client.surname}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted">
                            {formatPhone(client.cellphone)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
                        {counts.get(client.id) ?? 0} ag.
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-xs text-muted">{client.address}</p>
                    <div className="mt-2 flex justify-end gap-0.5 border-t border-line/70 pt-2">
                      <IconButton
                        label="Editar cliente"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => {
                          setEditing(client);
                          setFormOpen(true);
                        }}
                      />
                      <IconButton
                        label="Excluir cliente"
                        tone="danger"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setDeleting(client)}
                      />
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
              itemLabel="clientes"
            />
          </div>
        )}
      </section>

      <ClientForm
        open={formOpen}
        client={editing}
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
        title="Excluir cliente?"
        description={
          deleting
            ? `${deleting.name} ${deleting.surname} será removido permanentemente.${
                deletingCount > 0
                  ? ` Atenção: este cliente possui ${deletingCount} agendamento(s) e a API vai bloquear a exclusão até que eles sejam removidos.`
                  : ""
              }`
            : ""
        }
      />
    </>
  );
}
