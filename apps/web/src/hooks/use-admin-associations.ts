import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import type { Association } from "@/hooks/use-auth";
import {
  apiClient,
  fetchAllPages,
  getErrorMessage,
  unwrapData,
} from "@/lib/api-client";

export interface AssociationFormData {
  name: string;
  acronym?: string;
}

export function useAdminAssociations() {
  const queryClient = useQueryClient();

  const associationsQuery = useQuery<Association[], Error>({
    queryKey: ["admin-associations-list"],
    queryFn: () => fetchAllPages<Association>("/api/associations"),
  });

  const createAssociationMutation = useMutation({
    mutationFn: (payload: AssociationFormData) =>
      apiClient<Association>("/api/associations", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Association created",
        description: "New association successfully registered.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Creation failed",
        description: getErrorMessage(err),
      });
    },
  });

  const updateAssociationMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AssociationFormData>;
    }) =>
      apiClient<Association>(`/api/associations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Association updated",
        description: "Association details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteAssociationMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/associations/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Association deleted",
        description: "Association deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteAssociationsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          apiClient<void>(`/api/associations/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `Failed to delete ${failures.length} of ${ids.length} associations.`,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-associations-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-all"] });
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Associations deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "association" : "associations"}.`,
      });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  return {
    associations: unwrapData(associationsQuery.data),
    isLoading: associationsQuery.isLoading,
    isError: associationsQuery.isError,
    error: associationsQuery.error,
    createAssociationMutation,
    updateAssociationMutation,
    deleteAssociationMutation,
    bulkDeleteAssociationsMutation,
  };
}
