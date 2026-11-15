import { z } from "zod";

/* ------------------------------- Clientes ------------------------------- */

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  surname: z
    .string()
    .trim()
    .min(1, "Informe o sobrenome.")
    .max(50, "O sobrenome deve ter no máximo 50 caracteres."),
  cellphone: z
    .string()
    .regex(/^\d{10,11}$/, "Informe DDD + número, com 10 ou 11 dígitos."),
  address: z
    .string()
    .trim()
    .min(1, "Informe o endereço.")
    .max(200, "O endereço deve ter no máximo 200 caracteres."),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

/* ------------------------------ Técnicos -------------------------------- */

export const workerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  surname: z
    .string()
    .trim()
    .min(1, "Informe o sobrenome.")
    .max(50, "O sobrenome deve ter no máximo 50 caracteres."),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

/* ------------------------------ Serviços -------------------------------- */

export const taskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Descreva o serviço com pelo menos 3 caracteres.")
    .max(150, "A descrição deve ter no máximo 150 caracteres."),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

/* ---------------------------- Agendamentos ------------------------------ */

const appointmentBase = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Descreva o atendimento com pelo menos 3 caracteres.")
    .max(150, "A descrição deve ter no máximo 150 caracteres."),
  date: z.string().min(1, "Informe a data."),
  time: z.string().min(1, "Informe o horário."),
  status: z.enum(["1", "2", "3"]),
  taskId: z.string().min(1, "Selecione o serviço."),
  clientId: z.string().min(1, "Selecione o cliente."),
  workerId: z.string().min(1, "Selecione o técnico."),
});

export type AppointmentFormValues = z.infer<typeof appointmentBase>;

/**
 * A data só é validada como futura na criação.
 * Na edição, o backend permite manter um horário antigo inalterado
 * (para corrigir descrição/status de um agendamento já passado).
 */
export function appointmentSchema(isEditing: boolean) {
  return appointmentBase.superRefine((values, ctx) => {
    if (isEditing) return;

    const [year, month, day] = values.date.split("-").map(Number);
    const [hour, minute] = values.time.split(":").map(Number);
    const moment = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);

    if (Number.isNaN(moment.getTime())) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Data inválida." });
      return;
    }

    if (moment.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "Escolha uma data e um horário no futuro.",
      });
    }
  });
}
