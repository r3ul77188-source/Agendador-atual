/**
 * Helpers de data/hora.
 * A API usa LocalDateTime serializado com o pattern "HH:mm dd/MM/yyyy".
 */

const API_MOMENT_REGEX = /^(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/;

/** Converte "15:30 19/11/2026" em Date local. Retorna null se inválido. */
export function parseApiMoment(value: string): Date | null {
  if (!value) return null;

  const match = API_MOMENT_REGEX.exec(value.trim());
  if (match) {
    const [, hh, mm, dd, MM, yyyy] = match;
    const date = new Date(Number(yyyy), Number(MM) - 1, Number(dd), Number(hh), Number(mm));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Fallback: ISO (caso o backend mude o formato)
  const iso = new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

/** Converte um Date local em "HH:mm dd/MM/yyyy". */
export function toApiMoment(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
}

/** Combina os inputs date (yyyy-MM-dd) e time (HH:mm) no formato da API. */
export function buildApiMoment(date: string, time: string): string {
  const [yyyy, MM, dd] = date.split("-");
  return `${time} ${dd}/${MM}/${yyyy}`;
}

/** Extrai { date: "yyyy-MM-dd", time: "HH:mm" } de um moment da API. */
export function splitApiMoment(value: string): { date: string; time: string } {
  const parsed = parseApiMoment(value);
  if (!parsed) return { date: "", time: "" };

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFullMoment(value: string): string {
  const date = parseApiMoment(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Rótulo amigável do dia: Hoje, Amanhã ou "seg, 24 nov". */
export function dayLabel(date: Date): string {
  const today = new Date();
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((start(date) - start(today)) / 86_400_000);

  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function isPast(value: string): boolean {
  const date = parseApiMoment(value);
  return date ? date.getTime() < Date.now() : false;
}

export function isToday(value: string): boolean {
  const date = parseApiMoment(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/** Máscara visual de telefone: 11912345678 -> (11) 91234-5678 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function initials(first: string, last?: string): string {
  const a = first.trim().charAt(0);
  const b = (last ?? "").trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

/** Remove acentos e caixa para busca tolerante. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Data de hoje em "yyyy-MM-dd" (horário local). */
export function todayInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
