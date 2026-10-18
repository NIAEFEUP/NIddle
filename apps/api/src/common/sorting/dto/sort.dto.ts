import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "@/common/pagination";
import { SortOrder } from "@/common/sorting/enums/sort-order.enum";

export class SortDto extends PaginationDto {
  /**
   * Sort direction
   * @example 'ASC'
   */
  @ApiPropertyOptional({
    enum: SortOrder,
    description: "Sort direction",
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder | "ASC" | "DESC";
}
