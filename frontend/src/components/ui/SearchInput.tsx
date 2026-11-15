import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
  label = "Buscar",
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 sm:max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-9 text-sm text-text placeholder:text-muted/60 transition-colors hover:border-line/80 focus:border-accent/70 focus:outline-none focus:ring-4 focus:ring-accent/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:bg-surface-3 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          aria-label="Limpar busca"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
