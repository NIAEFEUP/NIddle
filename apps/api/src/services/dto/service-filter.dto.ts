import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";

export const SERVICE_SORT_FIELDS = ["name"] as const;

export class ServiceFilterDto extends createSortDto(SERVICE_SORT_FIELDS) {
  /**
   * The faculty UUID to filter services by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The faculty UUID to filter services by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  /**
   * The course UUID to filter services by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The course UUID to filter services by",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  /**
   * The association UUID that created the service.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The association UUID that created the service",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
