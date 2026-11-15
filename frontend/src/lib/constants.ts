import type { Status } from "../types/api";

export interface StatusMeta {
  label: string;
  code: 1 | 2 | 3;
  tone: "warning" | "info" | "success";
  dot: string;
}

export const STATUS_META: Record<Status, StatusMeta> = {
  PENDING: { label: "Pendente", code: 1, tone: "warning", dot: "#E3A33F" },
  PROCESS: { label: "Em andamento", code: 2, tone: "info", dot: "#6AA9F7" },
  COMPLETED: { label: "Concluído", code: 3, tone: "success", dot: "#48C997" },
};

export const STATUS_ORDER: Status[] = ["PENDING", "PROCESS", "COMPLETED"];

/** Opções para <select> — o valor enviado à API é numérico. */
export const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  value: String(STATUS_META[status].code),
  label: STATUS_META[status].label,
}));

export const PAGE_SIZE = 8;

export const WEEKDAYS_SHORT = [
  "dom",
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sáb",
];
