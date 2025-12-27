import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Faculty } from '../../faculties/faculty.entity';
import { ExistsInDb } from '../../validators/exists-in-db.validator';

export class CreateEventDto {
  /**
   * The event name.
   * @example 'FEUP Week'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The event description.
   * @example 'FEUP week is a period of interruption of classes and teaching mobility. It includes teaching activities (visits, exhibitions, lectures, ...), as well as the FEUP Project Congress.'
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * The year when the event occurs.
   * @example 2025
   */
  @IsNotEmpty()
  @IsInt()
  year: number;

  /**
   * The start date and time of the event.
   * @example '2025-12-26T09:00:00Z'
   */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /**
   * The end date and time of the event.
   * @example '2025-12-27T18:00:00Z'
   */
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /**
   * The faculty ID this event belongs to.
   * @example 1
   */
  @IsOptional()
  @IsInt()
  @ExistsInDb(Faculty)
  facultyId?: number;
}
