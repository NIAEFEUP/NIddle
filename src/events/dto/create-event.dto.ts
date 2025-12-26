import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

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
  description: string;

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
}
