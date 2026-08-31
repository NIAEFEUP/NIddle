import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { SortDto } from "./sort.dto";

export function createSortDto<const T extends readonly string[]>(
  allowedFields: T,
) {
  class GeneratedSortDto extends SortDto {
    /**
     * Field to sort by
     */
    @ApiPropertyOptional({
      enum: allowedFields as unknown as string[],
      description: "Field to sort by",
    })
    @IsOptional()
    @IsIn(allowedFields as unknown as string[])
    sortBy?: T[number];
  }

  return GeneratedSortDto;
}
