import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

export function GetAllUsersDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all users" }),
    ApiResponse({ status: 200, description: "List of users returned." }),
  );
}

export function CreateUserDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Create a new user" }),
    ApiResponse({ status: 201, description: "User created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function GetOneUserDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get user by UUID" }),
    ApiResponse({ status: 200, description: "User found." }),
    ApiResponse({ status: 204, description: "User not found." }),
  );
}

export function UpdateUserDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update a user by UUID" }),
    ApiResponse({ status: 200, description: "User updated." }),
    ApiResponse({ status: 204, description: "User not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteUserDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete a user by UUID" }),
    ApiResponse({ status: 200, description: "User deleted." }),
    ApiResponse({ status: 204, description: "User not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
