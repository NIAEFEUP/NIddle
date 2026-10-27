import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/hooks/use-admin-requests";
import { cn } from "@/lib/utils";

const statusClasses: Record<RequestStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({
  status,
  className,
}: RequestStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(statusClasses[status], className)}>
      {status}
    </Badge>
  );
}
