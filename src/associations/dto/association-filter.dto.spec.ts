import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AssociationFilterDto } from "./association-filter.dto";

describe("AssociationFilterDto", () => {
  describe("Transformation", () => {
    it("should transform string facultyId to number using @Type decorator", () => {
      const plain = {
        facultyId: "42",
      };

      const dto = plainToInstance(AssociationFilterDto, plain);

      expect(dto.facultyId).toBe(42);
      expect(typeof dto.facultyId).toBe("number");
    });

    it("should transform string courseId to number using @Type decorator", () => {
      const plain = {
        courseId: "10",
      };

      const dto = plainToInstance(AssociationFilterDto, plain);

      expect(dto.courseId).toBe(10);
      expect(typeof dto.courseId).toBe("number");
    });

    it("should transform both facultyId and courseId to numbers", () => {
      const plain = {
        facultyId: "1",
        courseId: "2",
      };

      const dto = plainToInstance(AssociationFilterDto, plain);

      expect(dto.facultyId).toBe(1);
      expect(dto.courseId).toBe(2);
      expect(typeof dto.facultyId).toBe("number");
      expect(typeof dto.courseId).toBe("number");
    });

    it("should keep numeric values as numbers", () => {
      const plain = {
        facultyId: 5,
        courseId: 10,
      };

      const dto = plainToInstance(AssociationFilterDto, plain);

      expect(dto.facultyId).toBe(5);
      expect(dto.courseId).toBe(10);
    });
  });

  describe("Validation", () => {
    it("should be valid with empty object", async () => {
      const dto = plainToInstance(AssociationFilterDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with only facultyId", async () => {
      const dto = plainToInstance(AssociationFilterDto, { facultyId: 1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with only courseId", async () => {
      const dto = plainToInstance(AssociationFilterDto, { courseId: 1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with both facultyId and courseId", async () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: 1,
        courseId: 2,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with undefined values", async () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: undefined,
        courseId: undefined,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should be valid with string numbers due to @IsOptional", async () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: "1",
        courseId: "2",
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("Optional fields", () => {
    it("should have undefined properties when not provided", () => {
      const dto = plainToInstance(AssociationFilterDto, {});

      expect(dto.facultyId).toBeUndefined();
      expect(dto.courseId).toBeUndefined();
    });

    it("should support partial data", () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: 1,
      });

      expect(dto.facultyId).toBe(1);
      expect(dto.courseId).toBeUndefined();
    });

    it("should support null values for optional fields", () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: null,
        courseId: null,
      });

      expect(dto.facultyId).toBeNull();
      expect(dto.courseId).toBeNull();
    });
  });

  describe("Type conversion edge cases", () => {
    it("should convert zero string to zero number", () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: "0",
        courseId: "0",
      });

      expect(dto.facultyId).toBe(0);
      expect(dto.courseId).toBe(0);
    });

    it("should handle large numbers", () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: "999999999",
        courseId: "999999999",
      });

      expect(dto.facultyId).toBe(999999999);
      expect(dto.courseId).toBe(999999999);
    });

    it("should handle negative numbers", () => {
      const dto = plainToInstance(AssociationFilterDto, {
        facultyId: "-1",
        courseId: "-1",
      });

      expect(dto.facultyId).toBe(-1);
      expect(dto.courseId).toBe(-1);
    });
  });
});
