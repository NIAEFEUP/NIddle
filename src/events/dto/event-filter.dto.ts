import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class EventFilterDto {
  /**
   * The year to filter events by.
   * @example 2025
   */
  @IsOptional()
  @Type(() => Number)
  year?: number;

  /**
   * The faculty ID to filter events by.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  facultyId?: number;

  /**
   * The course ID to filter events by.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  courseId?: number;
}
