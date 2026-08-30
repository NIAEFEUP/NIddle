import { IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "@/common/dto/pagination.dto";

export class ServiceFilterDto extends PaginationDto {
  /**
   * The faculty UUID to filter services by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  /**
   * The course UUID to filter services by.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsIn(["name"])
  sortBy?: string;

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}
