import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class FacultyTranslationDto {
  @IsString()
  languageCode: string;

  @IsString()
  name: string;

  @IsString()
  acronym: string;
}

export class CreateFacultyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacultyTranslationDto)
  translations: FacultyTranslationDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  courseIds?: number[];
}
