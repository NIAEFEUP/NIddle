import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "@/components/ui/toast";
import type { AdminEvent, EventFormData } from "@/hooks/use-admin-events";
import type { AdminRequest } from "@/hooks/use-admin-requests";
import { apiClient, fetchAllPages, getErrorMessage } from "@/lib/api-client";

export type EventRequestInput =
  | { action: "Create"; payload: EventFormData }
  | { action: "Update Existing"; targetId: string; payload: EventFormData }
  | { action: "Delete Existing"; targetId: string };

const requestToastTitles: Record<EventRequestInput["action"], string> = {
  Create: "Event requested",
  "Update Existing": "Changes requested",
  "Delete Existing": "Deletion requested",
};

export function useAssociationEvents(associationId: string) {
  const queryClient = useQueryClient();

  const eventsQueryKey = ["association-events", associationId];
  const pendingQueryKey = ["association-pending-event-requests", associationId];

  const eventsQuery = useQuery<AdminEvent[], Error>({
    queryKey: eventsQueryKey,
    queryFn: () =>
      fetchAllPages<AdminEvent>(`/api/events?createdById=${associationId}`),
  });

  const pendingRequestsQuery = useQuery<AdminRequest[], Error>({
    queryKey: pendingQueryKey,
    queryFn: () =>
      fetchAllPages<AdminRequest>("/api/requests?type=Event&status=Pending", {
        headers: { "x-active-association": associationId },
      }),
  });

  const pendingRequests = pendingRequestsQuery.data ?? [];

  const pendingByEventId = React.useMemo(() => {
    const byId = new Map<string, AdminRequest>();
    for (const request of pendingRequests) {
      if (request.targetEvent) byId.set(request.targetEvent.id, request);
    }
    return byId;
  }, [pendingRequests]);

  const pendingCreateCount = pendingRequests.filter(
    (request) => request.action === "Create",
  ).length;

  const createRequestMutation = useMutation({
    mutationFn: (input: EventRequestInput) =>
      apiClient<AdminRequest>("/api/requests", {
        method: "POST",
        headers: { "x-active-association": associationId },
        body: JSON.stringify({ type: "Event", ...input }),
      }),
    onSuccess: (_, input) => {
      toast.add({
        type: "success",
        title: requestToastTitles[input.action],
        description: "Your request was sent and is waiting for approval.",
      });
      queryClient.invalidateQueries({ queryKey: pendingQueryKey });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Request failed",
        description: getErrorMessage(err),
      });
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    pendingByEventId,
    pendingCreateCount,
    createRequestMutation,
  };
}
