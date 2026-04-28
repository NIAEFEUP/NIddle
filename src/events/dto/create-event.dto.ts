import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class EventTranslationDto {
  @IsString()
  languageCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateEventDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventTranslationDto)
  translations: EventTranslationDto[];

  @IsInt()
  year: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  facultyId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  courseIds?: number[];
}
