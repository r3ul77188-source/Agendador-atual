import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useCreateWorker, useUpdateWorker } from "../../hooks/useWorkers";
import { applyApiFieldErrors } from "../../lib/formErrors";
import { workerSchema, type WorkerFormValues } from "../../lib/schemas";
import type { WorkerSummary } from "../../types/api";

const emptyValues: WorkerFormValues = { name: "", surname: "" };

interface WorkerFormProps {
  open: boolean;
  onClose: () => void;
  worker?: WorkerSummary | null;
}

export function WorkerForm({ open, onClose, worker }: WorkerFormProps) {
  const isEditing = Boolean(worker);
  const createMutation = useCreateWorker();
  const updateMutation = useUpdateWorker();
  const loading = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(worker ? { name: worker.name, surname: worker.surname } : emptyValues);
  }, [open, worker, reset]);

  const onSubmit = async (values: WorkerFormValues) => {
    try {
      if (worker) {
        await updateMutation.mutateAsync({ id: worker.id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      applyApiFieldErrors(error, setError);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEditing ? "Editar cadastro" : "Novo cadastro"}
      title={isEditing ? "Editar técnico" : "Novo técnico"}
      description="Técnicos são vinculados aos agendamentos e não podem ter dois atendimentos no mesmo horário."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="worker-form" loading={loading}>
            {isEditing ? "Salvar alterações" : "Cadastrar técnico"}
          </Button>
        </>
      }
    >
      <form id="worker-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Nome" htmlFor="worker-name" required error={errors.name?.message}>
          <Input
            id="worker-name"
            placeholder="João"
            autoComplete="given-name"
            invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field label="Sobrenome" htmlFor="worker-surname" required error={errors.surname?.message}>
          <Input
            id="worker-surname"
            placeholder="Carlos"
            autoComplete="family-name"
            invalid={Boolean(errors.surname)}
            {...register("surname")}
          />
        </Field>
      </form>
    </Modal>
  );
}
