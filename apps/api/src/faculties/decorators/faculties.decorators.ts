import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";

export function GetAllFacultiesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all faculties" }),
    ApiResponse({ status: 200, description: "List of faculties returned." }),
  );
}

export function GetOneFacultyDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get faculty by UUID" }),
    ApiResponse({ status: 200, description: "Faculty found." }),
    ApiResponse({ status: 204, description: "Faculty not found." }),
  );
}

export function CreateFacultyDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Create a new faculty" }),
    ApiResponse({ status: 201, description: "Faculty created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateFacultyDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update a faculty by UUID" }),
    ApiResponse({ status: 200, description: "Faculty updated." }),
    ApiResponse({ status: 204, description: "Faculty not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteFacultyDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete a faculty by UUID" }),
    ApiResponse({ status: 200, description: "Faculty deleted." }),
    ApiResponse({ status: 204, description: "Faculty not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
