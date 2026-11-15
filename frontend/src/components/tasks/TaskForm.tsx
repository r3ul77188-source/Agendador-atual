import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";
import { applyApiFieldErrors } from "../../lib/formErrors";
import { taskSchema, type TaskFormValues } from "../../lib/schemas";
import type { TaskSummary } from "../../types/api";

const emptyValues: TaskFormValues = { description: "" };

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: TaskSummary | null;
}

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const isEditing = Boolean(task);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const loading = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  const description = watch("description") ?? "";

  useEffect(() => {
    if (!open) return;
    reset(task ? { description: task.description } : emptyValues);
  }, [open, task, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (task) {
        await updateMutation.mutateAsync({ id: task.id, payload: values });
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
      eyebrow={isEditing ? "Editar serviço" : "Novo serviço"}
      title={isEditing ? "Editar serviço" : "Novo serviço"}
      description="Descrição do serviço executado. O nome precisa ser único na base."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="task-form" loading={loading}>
            {isEditing ? "Salvar alterações" : "Cadastrar serviço"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Descrição do serviço"
          htmlFor="task-description"
          required
          error={errors.description?.message}
          hint={`${description.length}/150 caracteres`}
        >
          <Textarea
            id="task-description"
            placeholder="Limpeza de ar-condicionado split"
            maxLength={150}
            invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>
      </form>
    </Modal>
  );
}
