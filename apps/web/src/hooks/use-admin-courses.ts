import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { apiClient, getErrorMessage } from "@/lib/api-client";

export interface Faculty {
  id: number;
  name: string;
  acronym: string;
}

export interface Course {
  id: number;
  name: string;
  acronym: string;
  faculties?: Faculty[];
}

export interface CourseFormData {
  name: string;
  acronym: string;
  facultyIds?: number[];
}

export function useAdminCourses() {
  const queryClient = useQueryClient();

  const coursesQuery = useQuery<Course[], Error>({
    queryKey: ["admin-courses-list"],
    queryFn: () => apiClient<Course[]>("/api/courses"),
  });

  const facultiesQuery = useQuery<Faculty[]>({
    queryKey: ["admin-faculties-all"],
    queryFn: () => apiClient<Faculty[]>("/api/faculties"),
  });

  const createCourseMutation = useMutation({
    mutationFn: (payload: CourseFormData) =>
      apiClient<Course>("/api/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Course created",
        description: "New course successfully registered.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Creation failed",
        description: getErrorMessage(err),
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CourseFormData>;
    }) =>
      apiClient<Course>(`/api/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Course updated",
        description: "Course details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient<void>(`/api/courses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Course deleted",
        description: "Course deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteCoursesMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/courses/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Courses deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "course" : "courses"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses-all"] });
    },
  });

  return {
    courses: coursesQuery.data ?? [],
    faculties: facultiesQuery.data ?? [],
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    createCourseMutation,
    updateCourseMutation,
    deleteCourseMutation,
    bulkDeleteCoursesMutation,
  };
}
