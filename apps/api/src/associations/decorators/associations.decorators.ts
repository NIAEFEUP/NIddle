import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";

export function GetAllAssociationsDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all associations" }),
    ApiResponse({ status: 200, description: "List of associations returned." }),
  );
}

export function GetOneAssociationDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get association by UUID" }),
    ApiResponse({ status: 200, description: "Association found." }),
    ApiResponse({ status: 204, description: "Association not found." }),
  );
}

export function CreateAssociationDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Create a new association" }),
    ApiResponse({ status: 201, description: "Association created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateAssociationDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update an association by UUID" }),
    ApiResponse({ status: 200, description: "Association updated." }),
    ApiResponse({ status: 204, description: "Association not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteAssociationDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete an association by UUID" }),
    ApiResponse({ status: 200, description: "Association deleted." }),
    ApiResponse({ status: 204, description: "Association not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
