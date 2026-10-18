import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { apiClient, getErrorMessage } from "@/lib/api-client";

export interface Course {
  id: number;
  name: string;
  acronym: string;
}

export interface Faculty {
  id: number;
  name: string;
  acronym: string;
  courses?: Course[];
}

export interface FacultyFormData {
  name: string;
  acronym: string;
  courseIds?: number[];
}

export function useAdminFaculties() {
  const queryClient = useQueryClient();

  const facultiesQuery = useQuery<Faculty[], Error>({
    queryKey: ["admin-faculties-list"],
    queryFn: () => apiClient<Faculty[]>("/api/faculties"),
  });

  const coursesQuery = useQuery<Course[]>({
    queryKey: ["admin-courses-all"],
    queryFn: () => apiClient<Course[]>("/api/courses"),
  });

  const createFacultyMutation = useMutation({
    mutationFn: (payload: FacultyFormData) =>
      apiClient<Faculty>("/api/faculties", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Faculty created",
        description: "New faculty successfully registered.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Creation failed",
        description: getErrorMessage(err),
      });
    },
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<FacultyFormData>;
    }) =>
      apiClient<Faculty>(`/api/faculties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Faculty updated",
        description: "Faculty details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient<void>(`/api/faculties/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Faculty deleted",
        description: "Faculty deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteFacultiesMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/faculties/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Faculties deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "faculty" : "faculties"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faculties-all"] });
    },
  });

  return {
    faculties: facultiesQuery.data ?? [],
    courses: coursesQuery.data ?? [],
    isLoading: facultiesQuery.isLoading,
    isError: facultiesQuery.isError,
    error: facultiesQuery.error,
    createFacultyMutation,
    updateFacultyMutation,
    deleteFacultyMutation,
    bulkDeleteFacultiesMutation,
  };
}
