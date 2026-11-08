import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Clock, Code2, FileText, X } from "lucide-react";
import * as React from "react";
import { RequestDiffViewer } from "@/components/admin/requests/request-diff-viewer";
import {
  getRequestTitle,
  type RequestItem,
} from "@/components/admin/requests/request-types";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
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
  const isService =
    request?.type === "Service" && Boolean(request.targetService?.id);
  const targetServiceId = request?.targetService?.id;

  const { data: fullService } = useQuery({
    queryKey: ["service-detail", targetServiceId],
    queryFn: () =>
      apiClient<Record<string, any>>(`/api/services/${targetServiceId}`),
    enabled: Boolean(open && isService && !request?.targetService?.schedule),
  });

  const activeRequest = React.useMemo(() => {
    if (!request) return null;
    if (fullService && request.targetService) {
      return {
        ...request,
        targetService: {
          ...request.targetService,
          ...fullService,
        },
      };
    }
    return request;
  }, [request, fullService]);

  if (!activeRequest) return null;

  const title = getRequestTitle(activeRequest);
  const assocName =
    activeRequest.targetAssociation?.name ||
    activeRequest.targetAssociation?.acronym ||
    "Unknown Association";
  const assocAcronym = activeRequest.targetAssociation?.acronym;
  const assocInitials = getInitials(assocAcronym || assocName, "A");

  const requesterName = activeRequest.requestedBy?.name || "System";
  const requesterEmail = activeRequest.requestedBy?.email;
  const requesterInitials = getInitials(requesterName, "U");

  const createdDate = new Date(activeRequest.createdAt).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const reviewedDate = activeRequest.reviewedAt
    ? new Date(activeRequest.reviewedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const hasActions =
    activeRequest.status === "Pending" &&
    (Boolean(onApprove) || Boolean(onReject));

  const jsonData =
    activeRequest.action === "Create"
      ? { payload: activeRequest.payload }
      : activeRequest.action === "Update Existing"
        ? {
            proposedPayload: activeRequest.payload,
            currentResource:
              activeRequest.targetEvent || activeRequest.targetService || null,
          }
        : {
            target:
              activeRequest.targetEvent || activeRequest.targetService || null,
            requestInfo: {
              id: activeRequest.id,
              type: activeRequest.type,
              action: activeRequest.action,
            },
          };

  const jsonString = JSON.stringify(jsonData, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b space-y-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className="font-medium text-[11px] h-5 px-1.5"
            >
              {activeRequest.type}
            </Badge>
            <Badge
              variant="outline"
              className="font-medium text-[11px] h-5 px-1.5"
            >
              {activeRequest.action}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* 2-Column Layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column (Left, 2 cols): Switchable GUI Summary vs JSON Payload */}
          <div className="md:col-span-2">
            <Tabs defaultValue="summary" className="w-full space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {activeRequest.action === "Create"
                      ? "Resource Details"
                      : activeRequest.action === "Update Existing"
                        ? "Proposed Changes"
                        : "Resource to Delete"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeRequest.action === "Create"
                      ? `Review details for the new ${activeRequest.type.toLowerCase()} submission.`
                      : activeRequest.action === "Update Existing"
                        ? "Review differences between current resource and proposed changes."
                        : activeRequest.status === "Approved"
                          ? `This ${activeRequest.type.toLowerCase()} was removed upon approval.`
                          : activeRequest.status === "Rejected"
                            ? `This request to remove the ${activeRequest.type.toLowerCase()} was rejected.`
                            : `This live ${activeRequest.type.toLowerCase()} has been requested for removal.`}
                  </p>
                </div>

                <TabsList className="shrink-0 h-7 p-0.5">
                  <TabsTrigger
                    value="summary"
                    className="text-xs gap-1 px-2.5 py-0.5"
                  >
                    <FileText className="size-3" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="json"
                    className="text-xs gap-1 px-2.5 py-0.5"
                  >
                    <Code2 className="size-3" />
                    JSON
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* GUI Summary View */}
              <TabsContent value="summary" className="mt-0">
                <RequestDiffViewer request={activeRequest} />
              </TabsContent>

              {/* JSON Payload View */}
              <TabsContent value="json" className="mt-0">
                <CodeBlock size="sm">
                  <CodeBlockHeader className="px-3 pt-2">
                    <CodeBlockTitle>payload.json</CodeBlockTitle>
                    <CodeBlockActions>
                      <CodeBlockCopyButton value={jsonString} />
                    </CodeBlockActions>
                  </CodeBlockHeader>
                  <CodeBlockContent className="max-h-[48vh] text-xs px-3 py-2">
                    {jsonString}
                  </CodeBlockContent>
                </CodeBlock>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Column (Right, 1 col): Metadata & Context */}
          <div className="md:col-span-1 space-y-4 md:border-l md:pl-5">
            {/* Status Section */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                Status
              </span>
              <div>
                <Badge
                  variant={
                    activeRequest.status === "Approved"
                      ? "default"
                      : activeRequest.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className="gap-1 font-medium text-xs"
                >
                  {activeRequest.status === "Pending" && (
                    <Clock className="size-3" />
                  )}
                  {activeRequest.status === "Approved" && (
                    <Check className="size-3" />
                  )}
                  {activeRequest.status === "Rejected" && (
                    <X className="size-3" />
                  )}
                  {activeRequest.status}
                </Badge>
              </div>

              {activeRequest.status === "Rejected" &&
                activeRequest.rejectionReason && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2.5 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                      <AlertCircle className="size-3.5" />
                      Rejection Reason
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {activeRequest.rejectionReason}
                    </p>
                  </div>
                )}
            </div>

            <Separator />

            {/* Target Association */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                Association
              </span>
              <div className="flex items-center gap-2.5">
                <InitialsAvatar initials={assocInitials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate leading-tight">
                    {assocName}
                  </p>
                  {assocAcronym && assocAcronym !== assocName && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {assocAcronym}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Requested By */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                Requested by
              </span>
              <div className="flex items-center gap-2.5">
                <InitialsAvatar initials={requesterInitials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate leading-tight">
                    {requesterName}
                  </p>
                  {requesterEmail && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {requesterEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                  Submitted
                </span>
                <p className="text-foreground">{createdDate}</p>
              </div>
              {reviewedDate && (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                    Reviewed
                  </span>
                  <p className="text-foreground">{reviewedDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasActions && (
          <DialogFooter className="m-0 px-5 py-3 border-t bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:justify-end shrink-0">
            {onReject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onReject(activeRequest);
                }}
                className="text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onApprove(activeRequest);
                }}
              >
                Approve Request
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
