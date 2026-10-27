import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import type { FacultyOrCourse } from "@/hooks/use-faculty-course-options";
import { apiClient, fetchAllPages, getErrorMessage } from "@/lib/api-client";

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export interface ScheduleEntry {
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
}

export interface AdminService {
  id: string;
  name: string;
  email: string | null;
  location: string | null;
  phoneNumber: string | null;
  schedule: ScheduleEntry[];
  faculty: FacultyOrCourse | null;
  course: FacultyOrCourse | null;
  createdBy: { id: string; name: string; acronym?: string } | null;
}

export interface ServiceFormData {
  name: string;
  location: string;
  email: string | null;
  phoneNumber: string | null;
  facultyId?: string;
  courseId?: string;
  schedule: ScheduleEntry[];
}

/** Postgres `time` columns come back as HH:MM:SS; the API only accepts HH:MM. */
export function toShortTime(value: string): string {
  return value.slice(0, 5);
}

export function sortSchedule(schedule: ScheduleEntry[]): ScheduleEntry[] {
  return [...schedule].sort(
    (a, b) =>
      WEEK_DAYS.indexOf(a.dayOfWeek) - WEEK_DAYS.indexOf(b.dayOfWeek) ||
      a.startTime.localeCompare(b.startTime),
  );
}

const SERVICES_QUERY_KEY = ["admin-services-list"];

export function useAdminServices() {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery<AdminService[], Error>({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: () => fetchAllPages<AdminService>("/api/services"),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceFormData }) =>
      apiClient<AdminService>(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Service updated",
        description: "Service details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/services/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Service deleted",
        description: "Service deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteServicesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/services/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Services deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "service" : "services"}.`,
      });
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
  });

  return {
    services: servicesQuery.data ?? [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    updateServiceMutation,
    deleteServiceMutation,
    bulkDeleteServicesMutation,
  };
}
