import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class CourseTranslationDto {
  @IsString()
  languageCode: string;

  @IsString()
  name: string;

  @IsString()
  acronym: string;
}

export class CreateCourseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationDto)
  translations: CourseTranslationDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  facultyIds?: number[];
}
