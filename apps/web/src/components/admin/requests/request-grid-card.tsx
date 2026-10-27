import { Check, X } from "lucide-react";
import { RequestDetails } from "@/components/admin/requests/request-details";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import {
  DetailsToggle,
  gridCardDetailPanelClassName,
} from "@/components/common/detail-list";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import { Button } from "@/components/ui/button";
import {
  type AdminRequest,
  formatRequestDate,
  getRequestSubject,
} from "@/hooks/use-admin-requests";
import { getInitials } from "@/lib/utils";

export interface RequestGridCardProps {
  request: AdminRequest;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onApprove: (request: AdminRequest) => void;
  onReject: (request: AdminRequest) => void;
}

export function RequestGridCard({
  request,
  isSelected = false,
  onSelectChange,
  isExpanded = false,
  onExpandedChange,
  onApprove,
  onReject,
}: RequestGridCardProps) {
  const subject = getRequestSubject(request);
  const association =
    request.targetAssociation?.acronym || request.targetAssociation?.name;

  return (
    <GridCard
      avatar={<InitialsAvatar initials={getInitials(subject, "R")} size="md" />}
      title={subject}
      subtitle={`${request.action} · ${request.type}`}
      badge={<RequestStatusBadge status={request.status} />}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      actions={
        request.status === "Pending" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/10"
              onClick={() => onApprove(request)}
            >
              <Check className="size-3 mr-1.5" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
              onClick={() => onReject(request)}
            >
              <X className="size-3 mr-1.5" />
              Reject
            </Button>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground py-1.5">
            Reviewed {formatRequestDate(request.reviewedAt)}
          </span>
        )
      }
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Association:</span>
        <span className="font-medium text-foreground">
          {association || "—"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Requested by:</span>
        <span className="font-medium text-foreground truncate">
          {request.requestedBy?.name ?? "Deleted user"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Created:</span>
        <span className="font-medium text-foreground tabular-nums">
          {formatRequestDate(request.createdAt)}
        </span>
      </div>
      {request.status === "Rejected" && request.rejectionReason && (
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Reason:</span>
          <span className="text-foreground line-clamp-2">
            {request.rejectionReason}
          </span>
        </div>
      )}
      {onExpandedChange && (
        <>
          <DetailsToggle
            isExpanded={isExpanded}
            onExpandedChange={onExpandedChange}
          />
          {isExpanded && (
            <RequestDetails
              request={request}
              className={gridCardDetailPanelClassName}
            />
          )}
        </>
      )}
    </GridCard>
  );
}
