import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const COURSE_SORT_FIELDS = ["name", "acronym"] as const;

export class CourseFilterDto extends createSortDto(COURSE_SORT_FIELDS) {
  /**
   * The faculty UUID to filter courses by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The faculty UUID to filter courses by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  facultyId?: string;
}
