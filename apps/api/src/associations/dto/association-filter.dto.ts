import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const ASSOCIATION_SORT_FIELDS = ["name", "acronym"] as const;

export class AssociationFilterDto extends createSortDto(
  ASSOCIATION_SORT_FIELDS,
) {
  /**
   * Filter associations that a user belongs to
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "Filter associations by member user UUID",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
