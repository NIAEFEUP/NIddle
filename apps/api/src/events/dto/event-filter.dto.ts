import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsInt, IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const EVENT_SORT_FIELDS = ["name", "year", "startDate"] as const;

export class EventFilterDto extends createSortDto(EVENT_SORT_FIELDS) {
  /**
   * The year to filter events by.
   * @example 2025
   */
  @ApiPropertyOptional({
    description: "The year to filter events by",
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  /**
   * The faculty UUID to filter events by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The faculty UUID to filter events by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  /**
   * The course UUID to filter events by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The course UUID to filter events by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  /**
   * The association UUID that created the event.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The association UUID that created the event",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  /**
   * Filter events starting on or after this ISO date.
   * @example '2025-01-01T00:00:00.000Z'
   */
  @ApiPropertyOptional({
    description: "Filter events starting on or after this date",
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateFrom?: Date;

  /**
   * Filter events starting on or before this ISO date.
   * @example '2025-12-31T23:59:59.999Z'
   */
  @ApiPropertyOptional({
    description: "Filter events starting on or before this date",
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateTo?: Date;
}
