import { ApiProperty } from "@nestjs/swagger";

export interface PaginationMetaParameters {
  page: number;
  limit: number;
  itemCount: number;
  totalItems: number;
}

export class PaginationMetaDto {
  @ApiProperty({ description: "Current page number", example: 1 })
  readonly page: number;

  @ApiProperty({
    description: "Number of items requested per page",
    example: 10,
  })
  readonly limit: number;

  @ApiProperty({ description: "Number of items in current page", example: 10 })
  readonly itemCount: number;

  @ApiProperty({ description: "Total number of items available", example: 50 })
  readonly totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 5 })
  readonly totalPages: number;

  @ApiProperty({
    description: "Whether there is a previous page",
    example: false,
  })
  readonly hasPreviousPage: boolean;

  @ApiProperty({ description: "Whether there is a next page", example: true })
  readonly hasNextPage: boolean;

  constructor({
    page,
    limit,
    itemCount,
    totalItems,
  }: PaginationMetaParameters) {
    this.page = page;
    this.limit = limit;
    this.itemCount = itemCount;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(this.totalItems / this.limit) || 1;
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.totalPages;
  }
}
