import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FACULTY_SORT_FIELDS, FacultyFilterDto } from "./faculty-filter.dto";

describe("FacultyFilterDto", () => {
  const validUuid = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("keeps fields undefined when not provided", () => {
    const dto = plainToInstance(FacultyFilterDto, {});
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortOrder).toBeUndefined();
    expect(dto.courseId).toBeUndefined();
  });

  describe("courseId filter", () => {
    it("accepts a valid UUID", async () => {
      const dto = plainToInstance(FacultyFilterDto, { courseId: validUuid });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.courseId).toBe(validUuid);
    });

    it("rejects an invalid UUID", async () => {
      const dto = plainToInstance(FacultyFilterDto, {
        courseId: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "courseId")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      FACULTY_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(FacultyFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects an unwhitelisted sortBy value", async () => {
      const dto = plainToInstance(FacultyFilterDto, {
        sortBy: "invalidField",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(FacultyFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
