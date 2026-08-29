import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateFacultyDto {
  /**
   * The name of the faculty.
   * @example 'Faculty of Engineering'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The acronym of the faculty.
   * @example 'FEUP'
   */
  @IsString()
  @IsNotEmpty()
  acronym: string;

  /**
   * The UUIDs of the courses associated with the faculty.
   * @example ['123e4567-e89b-12d3-a456-426614174000']
   */
  @IsArray()
  @IsUUID("all", { each: true })
  @IsOptional()
  courseIds?: string[];
}
