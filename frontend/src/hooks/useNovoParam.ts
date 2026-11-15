import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/** Abre o formulário quando a URL contém ?novo=1 (atalhos do dashboard). */
export function useNovoParam(openNew: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("novo") !== "1") return;
    openNew();
    const next = new URLSearchParams(searchParams);
    next.delete("novo");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, openNew]);
}
