import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";
import { ApiPaginatedResponse } from "@/common/pagination";
import { Course } from "@/courses/entities/course.entity";

export function GetAllCoursesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all courses" }),
    ApiPaginatedResponse(Course, "List of courses returned."),
  );
}

export function GetOneCourseDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get course by UUID" }),
    ApiResponse({ status: 200, description: "Course found." }),
    ApiResponse({ status: 204, description: "Course not found." }),
  );
}

export function CreateCourseDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Create a new course" }),
    ApiResponse({ status: 201, description: "Course created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateCourseDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update a course by UUID" }),
    ApiResponse({ status: 200, description: "Course updated." }),
    ApiResponse({ status: 204, description: "Course not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function DeleteCourseDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete a course by UUID" }),
    ApiResponse({ status: 200, description: "Course deleted." }),
    ApiResponse({ status: 204, description: "Course not found." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}
