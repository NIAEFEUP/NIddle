import { IsNotEmpty, IsString } from 'class-validator';

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
}
