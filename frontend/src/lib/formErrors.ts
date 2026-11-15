import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./http";

/**
 * Copia os fieldErrors vindos da API para o formulário do react-hook-form.
 * Permite mapear nomes do backend (ex.: "moment") para campos do formulário (ex.: "time").
 */
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, Path<T>>,
) {
  if (!(error instanceof ApiError) || error.fieldErrors.length === 0) return;

  error.fieldErrors.forEach(({ field, message }) => {
    const target = fieldMap?.[field] ?? (field as Path<T>);
    setError(target, { type: "server", message }, { shouldFocus: true });
  });
}
