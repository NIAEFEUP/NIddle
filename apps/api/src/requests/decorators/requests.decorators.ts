import { applyDecorators, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import {
  ActiveAssociationGuard,
  OptionalActiveAssociationForAdmin,
} from "@/common/guards/active-association.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";
import { ApiPaginatedResponse } from "@/common/pagination";
import { Request } from "@/requests/entities/request.entity";

export function GetAllRequestsDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, ActiveAssociationGuard),
    OptionalActiveAssociationForAdmin(),
    ApiHeader({
      name: "x-active-association",
      description:
        "The UUID of the association the user is acting on. Required for non-admin users. Omitting this returns requests across every association.",
      required: false,
    }),
    ApiOperation({ summary: "Get all requests" }),
    ApiPaginatedResponse(Request, "List of requests returned."),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function GetOneRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, ActiveAssociationGuard),
    OptionalActiveAssociationForAdmin(),
    ApiHeader({
      name: "x-active-association",
      description:
        "The UUID of the association the user is acting on. Required for non-admin users.",
      required: false,
    }),
    ApiOperation({ summary: "Get request by UUID" }),
    ApiResponse({ status: 200, description: "Request found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Request not found." }),
  );
}

export function CreateRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on.",
      required: true,
    }),
    ApiOperation({ summary: "Create a new request" }),
    ApiResponse({ status: 201, description: "Request created." }),
    ApiResponse({ status: 400, description: "Bad request." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on.",
      required: true,
    }),
    ApiOperation({ summary: "Update a request by UUID" }),
    ApiResponse({ status: 200, description: "Request updated." }),
    ApiResponse({ status: 400, description: "Bad request." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Request not found." }),
  );
}

export function DeleteRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on.",
      required: true,
    }),
    ApiOperation({ summary: "Delete a request by UUID" }),
    ApiResponse({ status: 200, description: "Request deleted." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Request not found." }),
  );
}

export function ApproveRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({
      summary: "Approve a request and apply its changes to the target entity",
    }),
    ApiResponse({ status: 200, description: "Request approved." }),
    ApiResponse({ status: 400, description: "Bad request." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Request not found." }),
  );
}

export function RejectRequestDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Reject a request with a reason" }),
    ApiResponse({ status: 200, description: "Request rejected." }),
    ApiResponse({ status: 400, description: "Bad request." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Request not found." }),
  );
}
