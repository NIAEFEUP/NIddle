import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import {
  apiClient,
  getErrorMessage,
  type PaginatedResponse,
  unwrapData,
} from "@/lib/api-client";

export interface Course {
  id: string;
  name: string;
  acronym: string;
}

export interface Faculty {
  id: string;
  name: string;
  acronym: string;
  courses?: Course[];
}

export interface FacultyFormData {
  name: string;
  acronym: string;
  courseIds?: string[];
}

export function useAdminFaculties() {
  const queryClient = useQueryClient();

  const facultiesQuery = useQuery<Faculty[], Error>({
    queryKey: ["admin-faculties-list"],
    queryFn: async () => {
      const res = await apiClient<Faculty[] | PaginatedResponse<Faculty>>(
        "/api/faculties?limit=100",
      );
      return unwrapData(res);
    },
  });

  const coursesQuery = useQuery<Course[], Error>({
    queryKey: ["admin-courses-all"],
    queryFn: async () => {
      const res = await apiClient<Course[] | PaginatedResponse<Course>>(
        "/api/courses?limit=100",
      );
      return unwrapData(res);
    },
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
      id: string;
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
    mutationFn: (id: string) =>
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
    mutationFn: async (ids: string[]) => {
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
    faculties: unwrapData(facultiesQuery.data),
    courses: unwrapData(coursesQuery.data),
    isLoading: facultiesQuery.isLoading,
    isError: facultiesQuery.isError,
    error: facultiesQuery.error,
    createFacultyMutation,
    updateFacultyMutation,
    deleteFacultyMutation,
    bulkDeleteFacultiesMutation,
  };
}
