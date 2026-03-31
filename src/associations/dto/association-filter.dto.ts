import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class AssociationFilterDto {
  /**
   * The faculty ID to filter associations by.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  facultyId?: number;

  /**
   * The course ID to filter associations by.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  courseId?: number;
}
