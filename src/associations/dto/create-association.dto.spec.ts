import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateAssociationDto } from "./create-association.dto";

describe("CreateAssociationDto", () => {
  describe("Valid DTO", () => {
    it("should have no validation errors with valid required fields", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should have no validation errors with all fields", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;
      dto.courseId = 3;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should accept complete valid payload using plainToInstance", async () => {
      const plain = {
        name: "Photography Club",
        facultyId: 2,
        userId: 10,
        courseId: 5,
      };

      const dto = plainToInstance(CreateAssociationDto, plain);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("Photography Club");
      expect(dto.facultyId).toBe(2);
      expect(dto.userId).toBe(10);
      expect(dto.courseId).toBe(5);
    });
  });

  describe("Required fields validation", () => {
    it("should reject missing name", async () => {
      const dto = new CreateAssociationDto();
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should reject missing facultyId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });

    it("should reject missing userId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });

    it("should reject empty name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "";
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });
  });

  describe("Type validation", () => {
    it("should reject non-string name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = 123 as any;
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should reject non-integer facultyId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = "1" as any;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });

    it("should reject non-integer userId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = "5" as any;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });

    it("should reject float facultyId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1.5;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });

    it("should reject float userId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5.5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });
  });

  describe("Optional courseId", () => {
    it("should allow undefined courseId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "courseId")).toBe(false);
      expect(dto.courseId).toBeUndefined();
    });

    it("should accept valid courseId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;
      dto.courseId = 3;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "courseId")).toBe(false);
      expect(dto.courseId).toBe(3);
    });

    it("should reject non-integer courseId when provided", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;
      dto.courseId = "3" as any;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "courseId")).toBe(true);
    });

    it("should reject float courseId", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 1;
      dto.userId = 5;
      dto.courseId = 3.5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "courseId")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should accept zero as valid integer for IDs", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = 0;
      dto.userId = 0;
      dto.courseId = 0;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(false);
      expect(errors.some((e) => e.property === "userId")).toBe(false);
      expect(errors.some((e) => e.property === "courseId")).toBe(false);
    });

    it("should accept negative integers for IDs", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.facultyId = -1;
      dto.userId = -1;
      dto.courseId = -1;

      const errors = await validate(dto);

      // @IsInt only checks if it's an integer, not if it's positive
      expect(errors.some((e) => e.property === "facultyId")).toBe(false);
      expect(errors.some((e) => e.property === "userId")).toBe(false);
      expect(errors.some((e) => e.property === "courseId")).toBe(false);
    });

    it("should accept long name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "A".repeat(500);
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(false);
    });

    it("should accept whitespace-only name as not empty", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "   ";
      dto.facultyId = 1;
      dto.userId = 5;

      const errors = await validate(dto);

      // @IsNotEmpty checks for empty string, whitespace is not empty
      expect(errors.some((e) => e.property === "name")).toBe(false);
    });
  });
});
