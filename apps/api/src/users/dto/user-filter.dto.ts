import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const USER_SORT_FIELDS = ["name", "email"] as const;

export class UserFilterDto extends createSortDto(USER_SORT_FIELDS) {
  /**
   * Filter users by admin status
   * @example true
   */
  @ApiPropertyOptional({
    description: "Filter users by admin status",
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  })
  @IsBoolean()
  isAdmin?: boolean;

  /**
   * Filter users by association membership UUID
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "Filter users by association membership UUID",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  associationId?: string;
}
