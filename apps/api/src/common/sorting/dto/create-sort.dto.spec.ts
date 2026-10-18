import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SortOrder } from "@/common/sorting/enums/sort-order.enum";
import { createSortDto } from "./create-sort.dto";

describe("createSortDto", () => {
  const allowed = ["name", "createdAt"] as const;
  class TestFilterDto extends createSortDto(allowed) {}

  it("should create a DTO class that validates allowed sortBy values", async () => {
    const dto = plainToInstance(TestFilterDto, {
      sortBy: "name",
      sortOrder: SortOrder.DESC,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.sortBy).toBe("name");
    expect(dto.sortOrder).toBe(SortOrder.DESC);
  });

  it("should fail validation on unwhitelisted sortBy values", async () => {
    const dto = plainToInstance(TestFilterDto, {
      sortBy: "unallowedField",
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "sortBy")).toBe(true);
  });

  it("should allow pagination and undefined sort fields", async () => {
    const dto = plainToInstance(TestFilterDto, {
      page: 2,
      limit: 25,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(25);
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortOrder).toBeUndefined();
  });
});
