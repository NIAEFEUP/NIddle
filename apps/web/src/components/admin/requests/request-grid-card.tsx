import {
  Calendar,
  Check,
  Clock,
  Eye,
  Layers,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  getRequestSubtitle,
  getRequestTitle,
  type RequestItem,
} from "@/components/admin/requests/request-types";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export interface RequestGridCardProps {
  request: RequestItem;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onViewDetails: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
  onDelete: (request: RequestItem) => void;
}

export function RequestGridCard({
  request,
  isSelected = false,
  onSelectChange,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
}: RequestGridCardProps) {
  const title = getRequestTitle(request);
  const subtitle = getRequestSubtitle(request);
  const initials = getInitials(title, "R");

  const assocName =
    request.targetAssociation?.acronym ||
    request.targetAssociation?.name ||
    "—";

  const requesterName = request.requestedBy?.name || "System";
  const isPending = request.status === "Pending";
  const isApproved = request.status === "Approved";

  const statusBadgeClass = isPending
    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    : isApproved
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

  const actionColorClass =
    request.action === "Create"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : request.action === "Update Existing"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
        : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

  const createdDate = new Date(request.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <GridCard
      avatar={<InitialsAvatar initials={initials} size="md" />}
      title={title}
      subtitle={subtitle}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      badge={
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="gap-1 text-[10px] py-0 h-4">
            {request.type === "Event" ? (
              <Calendar className="size-2.5" />
            ) : (
              <Layers className="size-2.5" />
            )}
            {request.type}
          </Badge>
          <Badge
            variant="outline"
            className={`${actionColorClass} text-[10px] py-0 h-4`}
          >
            {request.action}
          </Badge>
        </div>
      }
      actions={
        <div className="flex w-full items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 text-xs gap-1"
            onClick={() => onViewDetails(request)}
          >
            <Eye className="size-3" />
            Details
          </Button>

          {isPending ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 text-xs gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
                onClick={() => onReject(request)}
              >
                <X className="size-3" />
                Reject
              </Button>
              <Button
                size="sm"
                className="h-8 flex-1 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onApprove(request)}
              >
                <Check className="size-3" />
                Approve
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
              onClick={() => onDelete(request)}
              title="Delete request record"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      }
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Status:</span>
        <Badge
          variant="outline"
          className={`${statusBadgeClass} gap-1 text-[10px] font-medium py-0 h-4`}
        >
          {isPending && <Clock className="size-2.5" />}
          {isApproved && <Check className="size-2.5" />}
          {!isPending && !isApproved && <X className="size-2.5" />}
          {request.status}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Association:</span>
        <span className="font-medium text-foreground">{assocName}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Requester:</span>
        <span className="font-medium text-foreground">{requesterName}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Submitted:</span>
        <span className="text-muted-foreground">{createdDate}</span>
      </div>

      {request.status === "Rejected" && request.rejectionReason && (
        <div className="mt-1 rounded-md border border-rose-500/20 bg-rose-500/5 p-2 text-[11px] text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-1 font-semibold mb-0.5">
            <XCircle className="size-3" /> Rejection Reason:
          </div>
          <p className="line-clamp-2 text-foreground/80">
            {request.rejectionReason}
          </p>
        </div>
      )}
    </GridCard>
  );
}
