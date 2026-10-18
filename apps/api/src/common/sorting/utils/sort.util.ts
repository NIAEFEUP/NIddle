import { FindOptionsOrder } from "typeorm";
import { SortOrder } from "@/common/sorting/enums/sort-order.enum";

export interface SortOptions {
  sortBy?: string;
  sortOrder?: SortOrder | "ASC" | "DESC";
}

export function buildOrderClause<T>(
  sortDto?: SortOptions,
  defaultTieBreaker: FindOptionsOrder<T> = {
    id: "ASC",
  } as unknown as FindOptionsOrder<T>,
): FindOptionsOrder<T> {
  const { sortBy, sortOrder } = sortDto ?? {};
  if (!sortBy) {
    return defaultTieBreaker;
  }

  const orderDirection = sortOrder ?? SortOrder.ASC;
  const order: Record<string, any> = { [sortBy]: orderDirection };

  for (const [key, value] of Object.entries(defaultTieBreaker)) {
    if (key !== sortBy) {
      order[key] = value;
    }
  }

  return order as FindOptionsOrder<T>;
}
