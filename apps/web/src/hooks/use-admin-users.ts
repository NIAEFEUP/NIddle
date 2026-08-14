import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import type { Association, User } from "@/hooks/use-auth";
import { apiClient, getErrorMessage } from "@/lib/api-client";

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  associationIds: number[];
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[], Error>({
    queryKey: ["admin-users-list"],
    queryFn: () => apiClient<User[]>("/api/users"),
  });

  const associationsQuery = useQuery<Association[]>({
    queryKey: ["admin-associations-all"],
    queryFn: () => apiClient<Association[]>("/api/associations"),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: UserFormData) =>
      apiClient<User>("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "User created",
        description: "New user successfully registered.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Registration failed",
        description: getErrorMessage(err),
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<UserFormData>;
    }) =>
      apiClient<User>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "User updated",
        description: "User details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient<void>(`/api/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "User deleted",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteUsersMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/users/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Users deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "user" : "users"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
  });

  return {
    users: usersQuery.data ?? [],
    associations: associationsQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    bulkDeleteUsersMutation,
  };
}
