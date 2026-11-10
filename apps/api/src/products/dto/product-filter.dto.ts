import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const PRODUCT_SORT_FIELDS = ["title"] as const;

export class ProductFilterDto extends createSortDto(PRODUCT_SORT_FIELDS) {
  /**
   * The association UUID that created the product.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The association UUID that created the product",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  /**
   * Filter products by whether they are archived.
   * @example false
   */
  @ApiPropertyOptional({
    description: "Filter products by whether they are archived",
    example: false,
  })
  @IsOptional()
  // Query values are strings, and Boolean("false") would be true.
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isArchived?: boolean;
}
