import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RequestItem } from "@/components/admin/requests/request-types";
import { toast } from "@/components/ui/toast";
import type { Association } from "@/hooks/use-auth";
import {
  apiClient,
  getErrorMessage,
  type PaginatedResponse,
  unwrapData,
} from "@/lib/api-client";

export function useAdminRequests() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery<RequestItem[], Error>({
    queryKey: ["admin-requests-list"],
    queryFn: async () => {
      const res = await apiClient<
        RequestItem[] | PaginatedResponse<RequestItem>
      >("/api/requests?limit=100");
      return unwrapData(res);
    },
  });

  const associationsQuery = useQuery<Association[], Error>({
    queryKey: ["admin-associations-all"],
    queryFn: async () => {
      const res = await apiClient<
        Association[] | PaginatedResponse<Association>
      >("/api/associations?limit=100");
      return unwrapData(res);
    },
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
        description: "The request has been approved and applied.",
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
      apiClient<RequestItem>(`/api/requests/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectionReason }),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Request rejected",
        description: "The request has been rejected.",
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

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/requests/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Request deleted",
        description: "Request record deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkApproveRequestsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<unknown>(`/api/requests/${id}/approve`, {
            method: "PATCH",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Requests approved",
        description: `Successfully approved ${ids.length} ${ids.length === 1 ? "request" : "requests"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk approval failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
  });

  const bulkRejectRequestsMutation = useMutation({
    mutationFn: async ({
      ids,
      rejectionReason,
    }: {
      ids: string[];
      rejectionReason: string;
    }) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<RequestItem>(`/api/requests/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ rejectionReason }),
          }),
        ),
      );
    },
    onSuccess: (_, { ids }) => {
      toast.add({
        type: "success",
        title: "Requests rejected",
        description: `Successfully rejected ${ids.length} ${ids.length === 1 ? "request" : "requests"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk rejection failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
  });

  const bulkDeleteRequestsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/requests/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Requests deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "request" : "requests"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
  });

  return {
    requests: unwrapData(requestsQuery.data),
    associations: unwrapData(associationsQuery.data),
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    error: requestsQuery.error,
    approveRequestMutation,
    rejectRequestMutation,
    deleteRequestMutation,
    bulkApproveRequestsMutation,
    bulkRejectRequestsMutation,
    bulkDeleteRequestsMutation,
  };
}
