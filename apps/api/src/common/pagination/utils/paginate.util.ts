import { FindManyOptions, Repository, SelectQueryBuilder } from "typeorm";
import { PaginatedResponseDto } from "@/common/pagination/dto/paginated-response.dto";
import { PaginationDto } from "@/common/pagination/dto/pagination.dto";
import { PaginationMetaDto } from "@/common/pagination/dto/pagination-meta.dto";

export async function paginate<T extends object>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  pagination: PaginationDto,
  options?: FindManyOptions<T>,
): Promise<PaginatedResponseDto<T>> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const skip = (page - 1) * limit;

  let items: T[];
  let totalItems: number;

  if ("findAndCount" in repositoryOrQueryBuilder) {
    [items, totalItems] = await repositoryOrQueryBuilder.findAndCount({
      ...options,
      skip,
      take: limit,
    });
  } else {
    [items, totalItems] = await repositoryOrQueryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  const meta = new PaginationMetaDto({
    page,
    limit,
    itemCount: items.length,
    totalItems,
  });

  return new PaginatedResponseDto(items, meta);
}
