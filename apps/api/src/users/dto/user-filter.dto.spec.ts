import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { USER_SORT_FIELDS, UserFilterDto } from "./user-filter.dto";

describe("UserFilterDto", () => {
  const validUuid = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("keeps fields undefined when not provided", () => {
    const dto = plainToInstance(UserFilterDto, {});
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortOrder).toBeUndefined();
    expect(dto.isAdmin).toBeUndefined();
    expect(dto.associationId).toBeUndefined();
  });

  describe("isAdmin filter", () => {
    it.each([
      ["true", true],
      ["false", false],
      [true, true],
      [false, false],
    ])("transforms %s to boolean %s", async (input, expected) => {
      const dto = plainToInstance(UserFilterDto, { isAdmin: input });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.isAdmin).toBe(expected);
    });

    it("rejects non-boolean strings", async () => {
      const dto = plainToInstance(UserFilterDto, { isAdmin: "not-a-bool" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "isAdmin")).toBe(true);
    });
  });

  describe("associationId filter", () => {
    it("accepts a valid UUID", async () => {
      const dto = plainToInstance(UserFilterDto, {
        associationId: validUuid,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.associationId).toBe(validUuid);
    });

    it("rejects an invalid UUID", async () => {
      const dto = plainToInstance(UserFilterDto, {
        associationId: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "associationId")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      USER_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(UserFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects an unwhitelisted sortBy value", async () => {
      const dto = plainToInstance(UserFilterDto, {
        sortBy: "invalidField",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(UserFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
