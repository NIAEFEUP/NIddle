import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  ASSOCIATION_SORT_FIELDS,
  AssociationFilterDto,
} from "./association-filter.dto";

describe("AssociationFilterDto", () => {
  const validUuid = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("keeps fields undefined when not provided", () => {
    const dto = plainToInstance(AssociationFilterDto, {});
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortOrder).toBeUndefined();
    expect(dto.userId).toBeUndefined();
  });

  describe("userId filter", () => {
    it("accepts a valid UUID", async () => {
      const dto = plainToInstance(AssociationFilterDto, { userId: validUuid });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.userId).toBe(validUuid);
    });

    it("rejects an invalid UUID", async () => {
      const dto = plainToInstance(AssociationFilterDto, {
        userId: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      ASSOCIATION_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(AssociationFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects an unwhitelisted sortBy value", async () => {
      const dto = plainToInstance(AssociationFilterDto, {
        sortBy: "invalidField",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(AssociationFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
