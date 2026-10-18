import { PaginationMetaDto } from "./pagination-meta.dto";

describe("PaginationMetaDto", () => {
  it("calculates totalPages, hasPreviousPage, hasNextPage correctly for middle page", () => {
    const meta = new PaginationMetaDto({
      page: 2,
      limit: 10,
      itemCount: 10,
      totalItems: 35,
    });

    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.itemCount).toBe(10);
    expect(meta.totalItems).toBe(35);
    expect(meta.totalPages).toBe(4);
    expect(meta.hasPreviousPage).toBe(true);
    expect(meta.hasNextPage).toBe(true);
  });

  it("calculates pagination correctly for the first page", () => {
    const meta = new PaginationMetaDto({
      page: 1,
      limit: 10,
      itemCount: 10,
      totalItems: 25,
    });

    expect(meta.hasPreviousPage).toBe(false);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.totalPages).toBe(3);
  });

  it("calculates pagination correctly for the last page", () => {
    const meta = new PaginationMetaDto({
      page: 3,
      limit: 10,
      itemCount: 5,
      totalItems: 25,
    });

    expect(meta.hasPreviousPage).toBe(true);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.totalPages).toBe(3);
  });

  it("handles zero total items gracefully", () => {
    const meta = new PaginationMetaDto({
      page: 1,
      limit: 10,
      itemCount: 0,
      totalItems: 0,
    });

    expect(meta.totalItems).toBe(0);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasPreviousPage).toBe(false);
    expect(meta.hasNextPage).toBe(false);
  });
});
