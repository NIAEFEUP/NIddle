import { PaginatedResponseDto } from "./paginated-response.dto";
import { PaginationMetaDto } from "./pagination-meta.dto";

describe("PaginatedResponseDto", () => {
  it("initializes data and meta correctly", () => {
    const data = [{ id: "1", name: "test" }];
    const meta = new PaginationMetaDto({
      page: 1,
      limit: 10,
      itemCount: 1,
      totalItems: 1,
    });

    const response = new PaginatedResponseDto(data, meta);

    expect(response.data).toBe(data);
    expect(response.meta).toBe(meta);
  });
});
