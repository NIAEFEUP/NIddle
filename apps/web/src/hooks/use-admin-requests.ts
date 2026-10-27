import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { apiClient, fetchAllPages, getErrorMessage } from "@/lib/api-client";

export const REQUEST_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export const REQUEST_TYPES = ["Service", "Event"] as const;
export const REQUEST_ACTIONS = [
  "Create",
  "Update Existing",
  "Delete Existing",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestAction = (typeof REQUEST_ACTIONS)[number];

export type RequestPayload = { name?: string } & Record<string, unknown>;

export interface AdminRequest {
  id: string;
  type: RequestType;
  action: RequestAction;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  payload: RequestPayload | null;
  requestedBy: { id: string; name: string; email: string } | null;
  targetAssociation: { id: string; name: string; acronym?: string };
  targetEvent: { id: string; name: string } | null;
  targetService: { id: string; name: string } | null;
}

export function getRequestSubject(request: AdminRequest): string {
  return (
    request.payload?.name ||
    request.targetEvent?.name ||
    request.targetService?.name ||
    `Untitled ${request.type.toLowerCase()}`
  );
}

export function formatRequestDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function useAdminRequests() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery<AdminRequest[], Error>({
    queryKey: ["admin-requests-list"],
    queryFn: () => fetchAllPages<AdminRequest>("/api/requests"),
  });

  const approveRequestMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<unknown>(`/api/requests/${id}/approve`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Request approved",
        description: "The requested changes have been applied.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Approval failed",
        description: getErrorMessage(err),
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    }) =>
      apiClient<AdminRequest>(`/api/requests/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectionReason }),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Request rejected",
        description: "The request has been marked as rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Rejection failed",
        description: getErrorMessage(err),
      });
    },
  });

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    error: requestsQuery.error,
    approveRequestMutation,
    rejectRequestMutation,
  };
}
