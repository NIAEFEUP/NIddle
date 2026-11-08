import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RequestItem } from "@/components/admin/requests/request-types";
import { toast } from "@/components/ui/toast";
import type { Association } from "@/hooks/use-auth";
import {
  apiClient,
  fetchAllPages,
  getErrorMessage,
  unwrapData,
} from "@/lib/api-client";

export function useAdminRequests() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery<RequestItem[], Error>({
    queryKey: ["admin-requests-list"],
    queryFn: () => fetchAllPages<RequestItem>("/api/requests"),
  });

  const associationsQuery = useQuery<Association[], Error>({
    queryKey: ["admin-associations-all"],
    queryFn: () => fetchAllPages<Association>("/api/associations"),
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
    mutationFn: (param: string | { id: string; associationId?: string }) => {
      const id = typeof param === "string" ? param : param.id;
      const associationId =
        typeof param === "string" ? undefined : param.associationId;
      return apiClient<void>(`/api/requests/${id}`, {
        method: "DELETE",
        headers: associationId
          ? { "x-active-association": associationId }
          : undefined,
      });
    },
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
      const results = await Promise.allSettled(
        ids.map((id) =>
          apiClient<unknown>(`/api/requests/${id}/approve`, {
            method: "PATCH",
          }),
        ),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `Failed to approve ${failures.length} of ${ids.length} requests.`,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Requests approved",
        description: `Successfully approved ${ids.length} ${ids.length === 1 ? "request" : "requests"}.`,
      });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk approval failed",
        description: getErrorMessage(err),
      });
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
      const results = await Promise.allSettled(
        ids.map((id) =>
          apiClient<RequestItem>(`/api/requests/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ rejectionReason }),
          }),
        ),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `Failed to reject ${failures.length} of ${ids.length} requests.`,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onSuccess: (_, { ids }) => {
      toast.add({
        type: "success",
        title: "Requests rejected",
        description: `Successfully rejected ${ids.length} ${ids.length === 1 ? "request" : "requests"}.`,
      });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk rejection failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteRequestsMutation = useMutation({
    mutationFn: async (
      items: Array<string | { id: string; associationId?: string }>,
    ) => {
      const results = await Promise.allSettled(
        items.map((item) => {
          const id = typeof item === "string" ? item : item.id;
          const associationId =
            typeof item === "string" ? undefined : item.associationId;
          return apiClient<void>(`/api/requests/${id}`, {
            method: "DELETE",
            headers: associationId
              ? { "x-active-association": associationId }
              : undefined,
          });
        }),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `Failed to delete ${failures.length} of ${items.length} requests.`,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests-list"] });
    },
    onSuccess: (_, items) => {
      toast.add({
        type: "success",
        title: "Requests deleted",
        description: `Successfully deleted ${items.length} ${items.length === 1 ? "request" : "requests"}.`,
      });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Bulk delete failed",
        description: getErrorMessage(err),
      });
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
