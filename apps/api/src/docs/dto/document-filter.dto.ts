import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "@/common/dto/pagination.dto";

export class DocumentFilterDto extends PaginationDto {
  /**
   * Search term matching title, subtitle, or description.
   * @example 'privacy'
   */
  @ApiPropertyOptional({
    description: "Search term to filter documents by title or subtitle",
    example: "privacy",
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filter by published status.
   * @example true
   */
  @ApiPropertyOptional({
    description: "Filter documents by published status",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return undefined;
  })
  isPublished?: boolean;
}
