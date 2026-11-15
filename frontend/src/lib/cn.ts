import clsx, { type ClassValue } from "clsx";

/** Junta classes condicionais (clsx). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
