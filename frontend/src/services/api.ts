import { api } from "../lib/http";
import type {
  AppointmentRequest,
  AppointmentResponse,
  ClientRequest,
  ClientSummary,
  TaskRequest,
  TaskSummary,
  WorkerRequest,
  WorkerSummary,
} from "../types/api";

/* ------------------------------- Clientes ------------------------------- */

export const clientsService = {
  list: async (): Promise<ClientSummary[]> => {
    const { data } = await api.get<ClientSummary[]>("/client");
    return data;
  },
  create: async (payload: ClientRequest): Promise<ClientSummary> => {
    const { data } = await api.post<ClientSummary>("/client", payload);
    return data;
  },
  update: async (id: number, payload: ClientRequest): Promise<ClientSummary> => {
    const { data } = await api.put<ClientSummary>(`/client/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/client/${id}`);
  },
};

/* ------------------------------- Técnicos ------------------------------- */

export const workersService = {
  list: async (): Promise<WorkerSummary[]> => {
    const { data } = await api.get<WorkerSummary[]>("/worker");
    return data;
  },
  create: async (payload: WorkerRequest): Promise<WorkerSummary> => {
    const { data } = await api.post<WorkerSummary>("/worker", payload);
    return data;
  },
  update: async (id: number, payload: WorkerRequest): Promise<WorkerSummary> => {
    const { data } = await api.put<WorkerSummary>(`/worker/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/worker/${id}`);
  },
};

/* ------------------------------- Serviços ------------------------------- */

export const tasksService = {
  list: async (): Promise<TaskSummary[]> => {
    const { data } = await api.get<TaskSummary[]>("/task");
    return data;
  },
  create: async (payload: TaskRequest): Promise<TaskSummary> => {
    const { data } = await api.post<TaskSummary>("/task", payload);
    return data;
  },
  update: async (id: number, payload: TaskRequest): Promise<TaskSummary> => {
    const { data } = await api.put<TaskSummary>(`/task/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/task/${id}`);
  },
};

/* ----------------------------- Agendamentos ----------------------------- */

export const appointmentsService = {
  list: async (): Promise<AppointmentResponse[]> => {
    const { data } = await api.get<AppointmentResponse[]>("/appointment");
    return data;
  },
  create: async (payload: AppointmentRequest): Promise<AppointmentResponse> => {
    const { data } = await api.post<AppointmentResponse>("/appointment", payload);
    return data;
  },
  update: async (id: number, payload: AppointmentRequest): Promise<AppointmentResponse> => {
    const { data } = await api.put<AppointmentResponse>(`/appointment/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/appointment/${id}`);
  },
};
