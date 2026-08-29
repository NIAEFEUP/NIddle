import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ServiceFilterDto } from "./service-filter.dto";

describe("ServiceFilterDto", () => {
  const validUuid1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const validUuid2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

  describe("Transformation & Assignment", () => {
    it("should keep string facultyId and courseId as string UUIDs", () => {
      const plain = {
        facultyId: validUuid1,
        courseId: validUuid2,
      };

      const dto = plainToInstance(ServiceFilterDto, plain);

      expect(dto.facultyId).toBe(validUuid1);
      expect(dto.courseId).toBe(validUuid2);
      expect(typeof dto.facultyId).toBe("string");
      expect(typeof dto.courseId).toBe("string");
    });
  });

  describe("Validation", () => {
    it("should be valid with empty object", async () => {
      const dto = plainToInstance(ServiceFilterDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with only facultyId UUID", async () => {
      const dto = plainToInstance(ServiceFilterDto, { facultyId: validUuid1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with only courseId UUID", async () => {
      const dto = plainToInstance(ServiceFilterDto, { courseId: validUuid1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with both facultyId and courseId UUIDs", async () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: validUuid1,
        courseId: validUuid2,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with undefined values", async () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: undefined,
        courseId: undefined,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should fail validation if facultyId or courseId is not a valid UUID", async () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: "invalid-uuid",
        courseId: "invalid-uuid",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
      expect(errors.some((e) => e.property === "courseId")).toBe(true);
    });
  });

  describe("Optional fields", () => {
    it("should have undefined properties when not provided", () => {
      const dto = plainToInstance(ServiceFilterDto, {});

      expect(dto.facultyId).toBeUndefined();
      expect(dto.courseId).toBeUndefined();
    });

    it("should support partial data", () => {
      const dto = plainToInstance(ServiceFilterDto, {
        facultyId: validUuid1,
      });

      expect(dto.facultyId).toBe(validUuid1);
      expect(dto.courseId).toBeUndefined();
    });
  });
});
