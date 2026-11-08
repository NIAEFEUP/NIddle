import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PRODUCT_SORT_FIELDS, ProductFilterDto } from "./product-filter.dto";

describe("ProductFilterDto", () => {
  const validUuid = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("keeps properties undefined when not provided", () => {
    const inst = plainToInstance(ProductFilterDto, {});
    expect(inst.createdById).toBeUndefined();
    expect(inst.isArchived).toBeUndefined();
    expect(inst.sortBy).toBeUndefined();
    expect(inst.sortOrder).toBeUndefined();
  });

  describe("isArchived", () => {
    it.each([
      ["true", true],
      ["false", false],
    ])("converts the query value %s to a boolean", async (value, expected) => {
      const dto = plainToInstance(ProductFilterDto, { isArchived: value });
      const errors = await validate(dto);

      expect(dto.isArchived).toBe(expected);
      expect(errors).toHaveLength(0);
    });

    it("rejects any other value", async () => {
      const dto = plainToInstance(ProductFilterDto, { isArchived: "banana" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "isArchived")).toBe(true);
    });
  });

  describe("createdById", () => {
    it("accepts a valid UUID", async () => {
      const dto = plainToInstance(ProductFilterDto, {
        createdById: validUuid,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects an invalid UUID", async () => {
      const dto = plainToInstance(ProductFilterDto, {
        createdById: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "createdById")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      PRODUCT_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(ProductFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects a sortBy value that isn't whitelisted", async () => {
      const dto = plainToInstance(ProductFilterDto, { sortBy: "description" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(ProductFilterDto, {
        sortBy: "title",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
