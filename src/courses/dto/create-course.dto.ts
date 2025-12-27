import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
   * The IDs of the faculties associated with the course.
   * @example [1, 2]
   */
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  facultyIds?: number[];
}
