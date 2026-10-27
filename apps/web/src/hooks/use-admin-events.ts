import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import type { FacultyOrCourse } from "@/hooks/use-faculty-course-options";
import { apiClient, fetchAllPages, getErrorMessage } from "@/lib/api-client";

export interface AdminEvent {
  id: string;
  name: string;
  description: string | null;
  year: number;
  startDate: string | null;
  endDate: string | null;
  faculty: FacultyOrCourse | null;
  courses: FacultyOrCourse[];
  createdBy: { id: string; name: string; acronym?: string } | null;
}

export interface EventFormData {
  name: string;
  description: string | null;
  year: number;
  startDate: string | null;
  endDate: string | null;
  facultyId: string | null;
  courseIds: string[];
}

export const EVENT_TIMINGS = [
  "Upcoming",
  "Ongoing",
  "Past",
  "Undated",
] as const;
export type EventTiming = (typeof EVENT_TIMINGS)[number];

export function getEventTiming(
  event: AdminEvent,
  now = Date.now(),
): EventTiming {
  if (!event.startDate) return "Undated";
  const start = new Date(event.startDate).getTime();
  const end = event.endDate ? new Date(event.endDate).getTime() : start;
  if (now < start) return "Upcoming";
  if (now > end) return "Past";
  return "Ongoing";
}

const EVENTS_QUERY_KEY = ["admin-events-list"];

export function useAdminEvents() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery<AdminEvent[], Error>({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => fetchAllPages<AdminEvent>("/api/events"),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EventFormData }) =>
      apiClient<AdminEvent>(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Event updated",
        description: "Event details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/events/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Event deleted",
        description: "Event deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
    },
  });

  const bulkDeleteEventsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient<void>(`/api/events/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: (_, ids) => {
      toast.add({
        type: "success",
        title: "Events deleted",
        description: `Successfully deleted ${ids.length} ${ids.length === 1 ? "event" : "events"}.`,
      });
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    updateEventMutation,
    deleteEventMutation,
    bulkDeleteEventsMutation,
  };
}
