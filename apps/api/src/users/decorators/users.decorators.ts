import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";
import { ApiPaginatedResponse } from "@/common/pagination";
import { User } from "@/users/entities/user.entity";

export function GetAllUsersDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Get all users" }),
    ApiPaginatedResponse(User, "List of users returned."),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
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
