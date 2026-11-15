import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { FieldMessage, StandError, ValidationError } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

export type ApiErrorKind = "http" | "network" | "timeout" | "unknown";

export class ApiError extends Error {
  readonly status: number | null;
  readonly detail: string;
  readonly fieldErrors: FieldMessage[];
  readonly kind: ApiErrorKind;

  constructor(params: {
    message: string;
    status?: number | null;
    detail?: string;
    fieldErrors?: FieldMessage[];
    kind?: ApiErrorKind;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status ?? null;
    this.detail = params.detail ?? "";
    this.fieldErrors = params.fieldErrors ?? [];
    this.kind = params.kind ?? "http";
  }

  get isConflict() {
    return this.status === 409;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

/** Traduz mensagens conhecidas do backend para PT-BR amigável. */
function translateServerMessage(message?: string): string | null {
  if (!message) return null;

  const dictionary: Record<string, string> = {
    "Appointment already exists for this worker at this time.":
      "Este técnico já possui um agendamento nesse horário. Escolha outro horário ou técnico.",
    "Date must be in the future": "O horário do agendamento precisa estar no futuro.",
    "Date cannot be null": "Informe a data e o horário do agendamento.",
    "Date invalid": "Data inválida. Escolha um horário no futuro.",
    "Client has appointments and cannot be removed. Delete the appointments first.":
      "Este cliente possui agendamentos vinculados. Exclua os agendamentos antes.",
    "Task has appointments and cannot be removed. Delete the appointments first.":
      "Este serviço possui agendamentos vinculados. Exclua os agendamentos antes.",
    "Worker has appointments and cannot be removed. Delete the appointments first.":
      "Este técnico possui agendamentos vinculados. Exclua os agendamentos antes.",
    "This record conflicts with data that already exists (unique field).":
      "Já existe um registro com este valor. Telefone, endereço e descrição de serviço devem ser únicos.",
    "Request body is invalid. Dates must follow the pattern 'HH:mm dd/MM/yyyy'.":
      "Dados inválidos. Verifique a data e o horário informados.",
  };

  if (dictionary[message]) return dictionary[message];

  if (/duplicate|unique/i.test(message) && /constraint|key/i.test(message)) {
    return "Já existe um registro com este valor único.";
  }

  return null;
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return "Não foi possível concluir. Verifique os dados destacados e tente novamente.";
    case 401:
      return "Sessão expirada. Entre novamente.";
    case 403:
      return "Você não tem permissão para esta ação.";
    case 404:
      return "Registro não encontrado. Ele pode ter sido removido.";
    case 409:
      return "Há um conflito com os dados atuais. Verifique e tente novamente.";
    case 422:
      return "Os dados enviados não puderam ser processados.";
    default:
      return status >= 500
        ? "A API encontrou um erro interno. Tente novamente em instantes."
        : "Não foi possível concluir a operação.";
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<StandError & Partial<ValidationError>>;

    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      return new ApiError({
        kind: "timeout",
        message:
          "A API demorou para responder. No plano gratuito do Render, a primeira chamada pode levar até 50 segundos.",
        detail: axiosError.message,
      });
    }

    if (!axiosError.response) {
      return new ApiError({
        kind: "network",
        message: `Não foi possível conectar à API em ${BASE_URL}. Verifique se o back-end está rodando.`,
        detail: axiosError.message,
      });
    }

    const { status, data } = axiosError.response;
    const fieldErrors = data && Array.isArray(data.fieldErrors) ? data.fieldErrors : [];
    const translated = translateServerMessage(data?.message);

    return new ApiError({
      kind: "http",
      status,
      detail: data?.message || axiosError.message,
      fieldErrors,
      message: translated ?? defaultMessage(status),
    });
  }

  return new ApiError({
    kind: "unknown",
    message: "Ocorreu um erro inesperado. Tente novamente.",
    detail: error instanceof Error ? error.message : String(error),
  });
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50_000,
  headers: { "Content-Type": "application/json" },
});

/** Injeta o token caso a API passe a usar autenticação (JWT). */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("pauta.token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Converte qualquer falha em ApiError com mensagem amigável. */
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

export { BASE_URL };
