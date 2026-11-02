import { Calendar, Check, Clock, Layers, X, XCircle } from "lucide-react";
import { RequestDiffViewer } from "@/components/admin/requests/request-diff-viewer";
import {
  getRequestSubtitle,
  getRequestTitle,
  type RequestItem,
} from "@/components/admin/requests/request-types";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";

export interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestItem | null;
  onApprove?: (request: RequestItem) => void;
  onReject?: (request: RequestItem) => void;
}

export function RequestDetailDialog({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
}: RequestDetailDialogProps) {
  if (!request) return null;

  const title = getRequestTitle(request);
  const subtitle = getRequestSubtitle(request);
  const assocName =
    request.targetAssociation?.acronym ||
    request.targetAssociation?.name ||
    "Unknown Association";
  const assocInitials = getInitials(assocName, "A");

  const requesterName = request.requestedBy?.name || "System/Unknown";
  const requesterEmail = request.requestedBy?.email;
  const requesterInitials = getInitials(requesterName, "U");

  const createdDate = new Date(request.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const reviewedDate = request.reviewedAt
    ? new Date(request.reviewedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type badge */}
            <Badge variant="secondary" className="gap-1 font-medium">
              {request.type === "Event" ? (
                <Calendar className="size-3" />
              ) : (
                <Layers className="size-3" />
              )}
              {request.type}
            </Badge>

            {/* Action badge */}
            <Badge
              variant="outline"
              className={
                request.action === "Create"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : request.action === "Update Existing"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }
            >
              {request.action}
            </Badge>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={
                request.status === "Pending"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1"
                  : request.status === "Approved"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1"
              }
            >
              {request.status === "Pending" && <Clock className="size-3" />}
              {request.status === "Approved" && <Check className="size-3" />}
              {request.status === "Rejected" && <X className="size-3" />}
              {request.status}
            </Badge>
          </div>

          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </DialogHeader>

        {/* Metadata grid */}
        <div className="rounded-lg border bg-muted/30 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Target Association
            </span>
            <div className="flex items-center gap-2">
              <InitialsAvatar initials={assocInitials} size="sm" />
              <span className="font-medium text-foreground">{assocName}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Requested By
            </span>
            <div className="flex items-center gap-2">
              <InitialsAvatar initials={requesterInitials} size="sm" />
              <div className="flex flex-col truncate">
                <span className="font-medium text-foreground truncate">
                  {requesterName}
                </span>
                {requesterEmail && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {requesterEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </span>
            <div className="text-muted-foreground">{createdDate}</div>
            {reviewedDate && (
              <div className="text-[10px] text-muted-foreground">
                Reviewed: {reviewedDate}
              </div>
            )}
          </div>
        </div>

        {/* Rejection callout if rejected */}
        {request.status === "Rejected" && request.rejectionReason && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
              Rejection Reason
            </div>
            <p className="text-xs text-foreground leading-relaxed pl-5.5">
              {request.rejectionReason}
            </p>
          </div>
        )}

        {/* Diff / payload inspection */}
        <div className="mt-2">
          <RequestDiffViewer request={request} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {request.status === "Pending" && (
            <div className="flex items-center gap-2">
              {onReject && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onReject(request);
                  }}
                  className="gap-1.5"
                >
                  <X className="size-3.5" />
                  Reject Request
                </Button>
              )}
              {onApprove && (
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onApprove(request);
                  }}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="size-3.5" />
                  Approve Request
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
