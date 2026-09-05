import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class DiffQueryDto {
  /**
   * Starting version to compare from.
   * @example 1
   */
  @ApiPropertyOptional({
    description: "Source version number to compare from",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  from?: number;

  /**
   * Target version to compare to. Defaults to current version.
   * @example 2
   */
  @ApiPropertyOptional({
    description:
      "Target version number to compare to (defaults to current version)",
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  to?: number;
}
