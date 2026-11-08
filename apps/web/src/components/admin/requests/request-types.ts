import type { Association, User } from "@/hooks/use-auth";

export type RequestStatus = "Pending" | "Approved" | "Rejected";
export type RequestType = "Service" | "Event";
export type RequestAction = "Create" | "Update Existing" | "Delete Existing";

export interface ScheduleItem {
  dayOfWeek: number | string;
  startTime?: string;
  endTime?: string;
  openingTime?: string;
  closingTime?: string;
  start?: string;
  end?: string;
  open?: string;
  close?: string;
}

export interface RequestItem {
  id: string;
  action: RequestAction;
  type: RequestType;
  status: RequestStatus;
  requestedBy: User | null;
  targetAssociation: Association;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  payload: Record<string, any> | null;
  targetEvent: Record<string, any> | null;
  targetService: Record<string, any> | null;
}

/**
 * Extracts the best display title for the request item
 */
export function getRequestTitle(request: RequestItem): string {
  const payloadName = request.payload?.name;
  if (payloadName && typeof payloadName === "string" && payloadName.trim()) {
    return payloadName;
  }

  if (request.targetEvent?.name) {
    return request.targetEvent.name;
  }

  if (request.targetService?.name) {
    return request.targetService.name;
  }

  return "Untitled Request";
}

/**
 * Extracts a concise summary subtitle for the request (e.g. Event or Service)
 */
export function getRequestSubtitle(request: RequestItem): string {
  return request.type;
}
