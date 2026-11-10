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
import { Product } from "@/products/entities/product.entity";

export function GetAllProductsDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get all products" }),
    ApiPaginatedResponse(Product, "List of products returned."),
  );
}

export function GetOneProductDecorator() {
  return applyDecorators(
    ApiOperation({ summary: "Get product by UUID" }),
    ApiResponse({ status: 200, description: "Product found." }),
    ApiResponse({ status: 404, description: "Product not found." }),
  );
}

export function CreateProductDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard, ActiveAssociationGuard),
    ApiHeader({
      name: "x-active-association",
      description: "The UUID of the association the user is acting on",
      required: true,
    }),
    ApiOperation({ summary: "Create a new product" }),
    ApiResponse({ status: 201, description: "Product created." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
  );
}

export function UpdateProductDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Update a product by UUID" }),
    ApiResponse({ status: 200, description: "Product updated." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Product not found." }),
  );
}

export function DeleteProductDecorator() {
  return applyDecorators(
    ApiBearerAuth("access-token"),
    UseGuards(JwtAuthGuard, AdminOnlyGuard),
    ApiOperation({ summary: "Delete a product by UUID" }),
    ApiResponse({ status: 200, description: "Product deleted." }),
    ApiResponse({ status: 401, description: "Unauthorized." }),
    ApiResponse({ status: 403, description: "Forbidden." }),
    ApiResponse({ status: 404, description: "Product not found." }),
  );
}
