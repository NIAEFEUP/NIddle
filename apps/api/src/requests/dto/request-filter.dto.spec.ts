import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestFilterDto } from "./request-filter.dto";

describe("RequestFilterDto transformation", () => {
  it("accepts a valid UUID string for requestedBy", async () => {
    const dto = plainToInstance(RequestFilterDto, {
      requestedBy: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.requestedBy).toEqual("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");
    expect(typeof dto.requestedBy).toBe("string");
  });

  it("rejects an invalid UUID requestedBy", async () => {
    const dto = plainToInstance(RequestFilterDto, { requestedBy: "abc" });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "requestedBy")).toBe(true);
  });

  it("is valid when no filters are provided", async () => {
    const dto = plainToInstance(RequestFilterDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe("sortBy / sortOrder", () => {
    it.each([
      "createdAt",
      "updatedAt",
      "reviewedAt",
    ])("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(RequestFilterDto, { sortBy });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("rejects a sortBy value that isn't whitelisted", async () => {
      const dto = plainToInstance(RequestFilterDto, { sortBy: "status" });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(RequestFilterDto, {
        sortBy: "createdAt",
        sortOrder,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("rejects an invalid sortOrder value", async () => {
      const dto = plainToInstance(RequestFilterDto, {
        sortBy: "createdAt",
        sortOrder: "sideways",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "sortOrder")).toBe(true);
    });
  });
});
