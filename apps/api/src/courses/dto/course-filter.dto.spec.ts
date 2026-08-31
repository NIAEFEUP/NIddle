import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { COURSE_SORT_FIELDS, CourseFilterDto } from "./course-filter.dto";

describe("CourseFilterDto", () => {
  const validUuid = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("keeps fields undefined when not provided", () => {
    const dto = plainToInstance(CourseFilterDto, {});
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortOrder).toBeUndefined();
    expect(dto.facultyId).toBeUndefined();
  });

  describe("facultyId filter", () => {
    it("accepts a valid UUID", async () => {
      const dto = plainToInstance(CourseFilterDto, { facultyId: validUuid });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.facultyId).toBe(validUuid);
    });

    it("rejects an invalid UUID", async () => {
      const dto = plainToInstance(CourseFilterDto, {
        facultyId: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      COURSE_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(CourseFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects an unwhitelisted sortBy value", async () => {
      const dto = plainToInstance(CourseFilterDto, {
        sortBy: "invalidField",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(CourseFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
