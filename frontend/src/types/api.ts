/**
 * Tipos gerados a partir dos DTOs/entidades Java da API Agendador.
 * Mantidos manualmente em sincronia com:
 *  - com.agendadorTarefas.agendador.dtos.*
 *  - com.agendadorTarefas.agendador.entities.enums.Status
 */

/** Enum Status do Java: PENDING(1) | PROCESS(2) | COMPLETED(3). */
export type Status = "PENDING" | "PROCESS" | "COMPLETED";

/** Código numérico aceito no POST/PUT de agendamento. */
export type StatusCode = 1 | 2 | 3;

export interface ClientSummary {
  id: number;
  name: string;
  surname: string;
  cellphone: string;
  address: string;
}

export interface ClientRequest {
  name: string;
  surname: string;
  cellphone: string;
  address: string;
}

export interface WorkerSummary {
  id: number;
  name: string;
  surname: string;
}

export interface WorkerRequest {
  name: string;
  surname: string;
}

export interface TaskSummary {
  id: number;
  description: string;
}

export interface TaskRequest {
  description: string;
}

export interface AppointmentResponse {
  id: number;
  description: string;
  /** Formato da API: "HH:mm dd/MM/yyyy" (ex.: "15:30 19/11/2026"). */
  moment: string;
  status: Status;
  task: TaskSummary;
  client: ClientSummary;
  worker: WorkerSummary;
}

export interface AppointmentRequest {
  description: string;
  /** "HH:mm dd/MM/yyyy" */
  moment: string;
  status: StatusCode;
  taskId: number;
  clientId: number;
  workerId: number;
}

/* ---------- Formato de erro ---------- */

export interface StandError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface FieldMessage {
  field: string;
  message: string;
}

export interface ValidationError extends StandError {
  fieldErrors: FieldMessage[];
}
