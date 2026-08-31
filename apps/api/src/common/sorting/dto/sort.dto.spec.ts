import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SortOrder } from "@/common/sorting/enums/sort-order.enum";
import { SortDto } from "./sort.dto";

describe("SortDto", () => {
  it("keeps sortOrder undefined when not provided", () => {
    const dto = plainToInstance(SortDto, {});
    expect(dto.sortOrder).toBeUndefined();
  });

  it("inherits pagination defaults (page: 1, limit: 10)", () => {
    const dto = plainToInstance(SortDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it.each([
    SortOrder.ASC,
    SortOrder.DESC,
  ])("validates successfully with %s", async (sortOrder) => {
    const dto = plainToInstance(SortDto, { sortOrder });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("rejects an invalid sortOrder", async () => {
    const dto = plainToInstance(SortDto, { sortOrder: "INVALID_ORDER" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "sortOrder")).toBe(true);
  });
});
