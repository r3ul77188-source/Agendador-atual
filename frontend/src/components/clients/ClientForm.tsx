import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useCreateClient, useUpdateClient } from "../../hooks/useClients";
import { applyApiFieldErrors } from "../../lib/formErrors";
import { formatPhone } from "../../lib/format";
import { clientSchema, type ClientFormValues } from "../../lib/schemas";
import type { ClientSummary } from "../../types/api";

const emptyValues: ClientFormValues = {
  name: "",
  surname: "",
  cellphone: "",
  address: "",
};

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  client?: ClientSummary | null;
}

export function ClientForm({ open, onClose, client }: ClientFormProps) {
  const isEditing = Boolean(client);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const loading = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      client
        ? {
            name: client.name,
            surname: client.surname,
            cellphone: client.cellphone.replace(/\D/g, ""),
            address: client.address,
          }
        : emptyValues,
    );
  }, [open, client, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    try {
      if (client) {
        await updateMutation.mutateAsync({ id: client.id, payload: values });
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
      title={isEditing ? "Editar cliente" : "Novo cliente"}
      description="Dados de contato usados para identificar e avisar o cliente sobre o atendimento."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" loading={loading}>
            {isEditing ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="client-name" required error={errors.name?.message}>
            <Input
              id="client-name"
              placeholder="Maria"
              autoComplete="given-name"
              invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>

          <Field
            label="Sobrenome"
            htmlFor="client-surname"
            required
            error={errors.surname?.message}
          >
            <Input
              id="client-surname"
              placeholder="Oliveira"
              autoComplete="family-name"
              invalid={Boolean(errors.surname)}
              {...register("surname")}
            />
          </Field>
        </div>

        <Field
          label="Celular"
          htmlFor="client-cellphone"
          required
          hint="Somente números, com DDD (10 ou 11 dígitos)."
          error={errors.cellphone?.message}
        >
          <Controller
            control={control}
            name="cellphone"
            render={({ field }) => (
              <Input
                id="client-cellphone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 91234-5678"
                value={formatPhone(field.value)}
                onChange={(event) =>
                  field.onChange(event.target.value.replace(/\D/g, "").slice(0, 11))
                }
                onBlur={field.onBlur}
                name={field.name}
                invalid={Boolean(errors.cellphone)}
              />
            )}
          />
        </Field>

        <Field
          label="Endereço"
          htmlFor="client-address"
          required
          hint="Rua, número, bairro e cidade."
          error={errors.address?.message}
        >
          <Input
            id="client-address"
            placeholder="Rua das Acácias, 120 — São Paulo"
            autoComplete="street-address"
            invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </Field>
      </form>
    </Modal>
  );
}
