import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class ServiceFilterDto {
  /**
   * The faculty ID to filter services by.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  facultyId?: number;

  /**
   * The course ID to filter services by.
   */
  @IsOptional()
  @Type(() => Number)
  courseId?: number;
}
