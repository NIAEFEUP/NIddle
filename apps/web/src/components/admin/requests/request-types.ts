import type { Association, User } from "@/hooks/use-auth";

export type RequestStatus = "Pending" | "Approved" | "Rejected";
export type RequestType = "Service" | "Event";
export type RequestAction = "Create" | "Update Existing" | "Delete Existing";

export interface ScheduleItem {
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
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

  return `${request.action} ${request.type}`;
}

/**
 * Extracts a concise summary subtitle for the request
 */
export function getRequestSubtitle(request: RequestItem): string {
  if (request.action === "Create") {
    return `Proposed new ${request.type.toLowerCase()}`;
  }

  const targetName = request.targetEvent?.name || request.targetService?.name;

  if (request.action === "Update Existing") {
    return targetName
      ? `Updating: ${targetName}`
      : `Update existing ${request.type.toLowerCase()}`;
  }

  if (request.action === "Delete Existing") {
    return targetName
      ? `Target: ${targetName}`
      : `Delete existing ${request.type.toLowerCase()}`;
  }

  return "";
}
