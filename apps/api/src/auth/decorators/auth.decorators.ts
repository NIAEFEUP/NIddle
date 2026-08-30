import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { LocalAuthGuard } from "@/auth/guards/local-auth.guard";

export function GetProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard),
    ApiOperation({ summary: "Get user profile" }),
    ApiResponse({
      status: 200,
      description: "User profile returned successfully.",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized: Missing or invalid JWT.",
    }),
  );
}

export function SignInDecorator() {
  return applyDecorators(
    UseGuards(LocalAuthGuard),
    ApiOperation({ summary: "User login (JWT issuance)" }),
    ApiResponse({
      status: 201,
      description: "Login successful, JWT returned.",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized: Invalid credentials.",
    }),
  );
}
