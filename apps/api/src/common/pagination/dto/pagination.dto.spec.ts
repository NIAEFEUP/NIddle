import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaginationDto } from "./pagination.dto";

describe("PaginationDto", () => {
  describe("defaults", () => {
    it("defaults page to 1 and limit to 10 when not provided", () => {
      const dto = plainToInstance(PaginationDto, {});

      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it("is valid when no values are provided", async () => {
      const dto = plainToInstance(PaginationDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("transformation", () => {
    it("converts numeric strings to numbers via @Type", () => {
      const dto = plainToInstance(PaginationDto, { page: "2", limit: "20" });

      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(20);
      expect(typeof dto.page).toBe("number");
      expect(typeof dto.limit).toBe("number");
    });
  });

  describe("validation", () => {
    it("is valid with page and limit within range", async () => {
      const dto = plainToInstance(PaginationDto, { page: 3, limit: 50 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("rejects a page below 1", async () => {
      const dto = plainToInstance(PaginationDto, { page: 0 });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "page")).toBe(true);
    });

    it("rejects a non-integer page", async () => {
      const dto = plainToInstance(PaginationDto, { page: 1.5 });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "page")).toBe(true);
    });

    it("rejects a limit below 1", async () => {
      const dto = plainToInstance(PaginationDto, { limit: 0 });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "limit")).toBe(true);
    });

    it("rejects a limit above 100", async () => {
      const dto = plainToInstance(PaginationDto, { limit: 101 });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "limit")).toBe(true);
    });

    it("rejects a non-integer limit", async () => {
      const dto = plainToInstance(PaginationDto, { limit: 10.5 });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "limit")).toBe(true);
    });
  });
});
