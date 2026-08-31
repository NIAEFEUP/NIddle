import { Type } from "class-transformer";
import { IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "@/common/pagination";

export class EventFilterDto extends PaginationDto {
  /**
   * The year to filter events by.
   * @example 2025
   */
  @IsOptional()
  @Type(() => Number)
  year?: number;

  /**
   * The faculty UUID to filter events by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  /**
   * The course UUID to filter events by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsIn(["name", "year", "startDate"])
  sortBy?: string;

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}
