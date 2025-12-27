import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class EventFilterDto {
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  facultyId?: number;
}
