import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateCourseDto {
  /**
   * The name of the course.
   * @example 'Bachelor in Informatics and Computing Engineering'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The acronym of the course.
   * @example 'LEIC'
   */
  @IsString()
  @IsNotEmpty()
  acronym: string;

  /**
   * The UUIDs of the faculties associated with the course.
   * @example ['123e4567-e89b-12d3-a456-426614174000']
   */
  @IsArray()
  @IsUUID("all", { each: true })
  @IsOptional()
  facultyIds?: string[];
}
