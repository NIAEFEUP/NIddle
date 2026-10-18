import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const FACULTY_SORT_FIELDS = ["name", "acronym"] as const;

export class FacultyFilterDto extends createSortDto(FACULTY_SORT_FIELDS) {
  /**
   * The course UUID to filter faculties by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The course UUID to filter faculties by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
