import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SERVICE_SORT_FIELDS, ServiceFilterDto } from "./service-filter.dto";

describe("ServiceFilterDto", () => {
  const validUuid1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const validUuid2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
  const validUuid3 = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

  describe("Transformation & Assignment", () => {
    it("should keep string facultyId, courseId, and createdById as string UUIDs", () => {
      const plain = {
        facultyId: validUuid1,
        courseId: validUuid2,
        createdById: validUuid3,
      };

      const dto = plainToInstance(ServiceFilterDto, plain);

      expect(dto.facultyId).toBe(validUuid1);
      expect(dto.courseId).toBe(validUuid2);
      expect(dto.createdById).toBe(validUuid3);
    });
  });

  describe("Validation", () => {
    it("should be valid with empty object", async () => {
      const dto = plainToInstance(ServiceFilterDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should be valid with all UUID fields", async () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: validUuid1,
        courseId: validUuid2,
        createdById: validUuid3,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation if any ID is not a valid UUID", async () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: "invalid-uuid",
        courseId: "invalid-uuid",
        createdById: "invalid-uuid",
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
      expect(errors.some((e) => e.property === "courseId")).toBe(true);
      expect(errors.some((e) => e.property === "createdById")).toBe(true);
    });

    it.each(
      SERVICE_SORT_FIELDS,
    )("should be valid with sortBy %s", async (sortBy) => {
      const dto = plainToInstance(ServiceFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation for an unwhitelisted sortBy value", async () => {
      const dto = plainToInstance(ServiceFilterDto, { sortBy: "location" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("should be valid with sortOrder %s", async (sortOrder) => {
      const dto = plainToInstance(ServiceFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
