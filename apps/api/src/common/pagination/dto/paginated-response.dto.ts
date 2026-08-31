import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaDto } from "./pagination-meta.dto";

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  readonly meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
