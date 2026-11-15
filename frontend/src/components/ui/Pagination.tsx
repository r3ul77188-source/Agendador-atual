import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function buildPages(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "gap"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("gap");
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < totalPages - 1) pages.push("gap");
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  itemLabel = "registros",
}: PaginationProps) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pages = buildPages(page, totalPages);

  const navButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted">
        Mostrando <span className="font-mono text-text">{first}</span>–
        <span className="font-mono text-text">{last}</span> de{" "}
        <span className="font-mono text-text">{total}</span> {itemLabel}
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginação">
        <button
          type="button"
          className={navButton}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-lg px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                item === page
                  ? "bg-accent text-accent-ink"
                  : "border border-line bg-surface-2 text-muted hover:border-accent/40 hover:text-text",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className={navButton}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
