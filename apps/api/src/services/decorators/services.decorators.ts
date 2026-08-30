import { applyDecorators, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

export function GetAllServicesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all services" }),
    ApiResponse({ status: 200, description: "List of services returned." }),
  );
}

export function GetOneServiceDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get service by UUID" }),
    ApiResponse({ status: 200, description: "Service found." }),
    ApiResponse({ status: 204, description: "Service not found" }),
  );
}

export function CreateServiceDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on",
      required: true,
    }),
    ApiOperation({ summary: "Create a new service" }),
    ApiResponse({ status: 201, description: "Service created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateServiceDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update a service by UUID" }),
    ApiResponse({ status: 200, description: "Service updated." }),
    ApiResponse({ status: 204, description: "Service not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteServiceDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete a service by UUID" }),
    ApiResponse({ status: 200, description: "Service deleted." }),
    ApiResponse({ status: 204, description: "Service not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
