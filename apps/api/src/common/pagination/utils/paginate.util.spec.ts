import { Repository, SelectQueryBuilder } from "typeorm";
import { PaginationDto } from "@/common/pagination/dto/pagination.dto";
import { paginate } from "./paginate.util";

describe("paginate utility", () => {
  it("paginates using a Repository", async () => {
    const items = [{ id: "1", name: "Test 1" }];
    const totalCount = 25;
    const mockRepo = {
      findAndCount: jest.fn().mockResolvedValue([items, totalCount]),
    } as unknown as Repository<{ id: string; name: string }>;

    const pagination: PaginationDto = {
      page: 2,
      limit: 10,
    };

    const result = await paginate(mockRepo, pagination, {
      relations: ["relationA"],
    });

    expect(mockRepo.findAndCount).toHaveBeenCalledWith({
      relations: ["relationA"],
      skip: 10,
      take: 10,
    });
    expect(result.data).toEqual(items);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalItems).toBe(25);
    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.hasPreviousPage).toBe(true);
    expect(result.meta.hasNextPage).toBe(true);
  });

  it("paginates using a SelectQueryBuilder", async () => {
    const items = [{ id: "1", name: "Test 1" }];
    const totalCount = 1;

    const mockQb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([items, totalCount]),
    } as unknown as SelectQueryBuilder<{ id: string; name: string }>;

    const pagination: PaginationDto = {
      page: 1,
      limit: 10,
    };

    const result = await paginate(mockQb, pagination);

    expect(mockQb.skip).toHaveBeenCalledWith(0);
    expect(mockQb.take).toHaveBeenCalledWith(10);
    expect(result.data).toEqual(items);
    expect(result.meta.totalPages).toBe(1);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(false);
  });
});
