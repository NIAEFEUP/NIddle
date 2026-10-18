import { applyDecorators, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { ActiveAssociationGuard } from "@/common/guards/active-association.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";
import { ApiPaginatedResponse } from "@/common/pagination";
import { Event } from "@/events/entities/event.entity";

export function GetAllEventsDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all events" }),
    ApiPaginatedResponse(Event, "List of events returned."),
  );
}

export function GetOneEventDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get event by UUID" }),
    ApiResponse({ status: 200, description: "Event found." }),
    ApiResponse({ status: 204, description: "Event not found." }),
  );
}

export function CreateEventDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on",
      required: true,
    }),
    ApiOperation({ summary: "Create a new event" }),
    ApiResponse({ status: 201, description: "Event created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateEventDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update an event by UUID" }),
    ApiResponse({ status: 200, description: "Event updated." }),
    ApiResponse({ status: 204, description: "Event not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteEventDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete an event by UUID" }),
    ApiResponse({ status: 200, description: "Event deleted." }),
    ApiResponse({ status: 204, description: "Event not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
