import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
   * The IDs of the courses associated with the faculty.
   * @example [1, 2]
   */
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  courseIds?: number[];
}
