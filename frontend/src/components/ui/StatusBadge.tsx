import { STATUS_META } from "../../lib/constants";
import type { Status } from "../../types/api";
import { Badge } from "./Badge";

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}
