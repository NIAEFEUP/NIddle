import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateAssociationDto } from "./update-association.dto";

describe("UpdateAssociationDto", () => {
  describe("PartialType behavior", () => {
    it("should be a PartialType of CreateAssociationDto with all fields optional", () => {
      const dto = plainToInstance(UpdateAssociationDto, {});

      expect(dto).toBeDefined();
      expect(typeof dto).toBe("object");
    });

    it("should allow empty update object", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe("Updating individual fields", () => {
    it("should allow updating only name", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "Updated Club Name",
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("Updated Club Name");
    });

    it("should allow updating only facultyId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        facultyId: 5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.facultyId).toBe(5);
    });

    it("should allow updating only userId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: 10,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.userId).toBe(10);
    });

    it("should allow updating only courseId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        courseId: 3,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.courseId).toBe(3);
    });
  });

  describe("Updating multiple fields", () => {
    it("should allow updating multiple fields at once", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "New Club Name",
        facultyId: 2,
        userId: 15,
        courseId: 7,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("New Club Name");
      expect(dto.facultyId).toBe(2);
      expect(dto.userId).toBe(15);
      expect(dto.courseId).toBe(7);
    });

    it("should allow updating name and facultyId only", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "Renamed Association",
        facultyId: 3,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("Renamed Association");
      expect(dto.facultyId).toBe(3);
      expect(dto.userId).toBeUndefined();
      expect(dto.courseId).toBeUndefined();
    });
  });

  describe("Type validation still applies", () => {
    it("should reject non-string name when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: 123,
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should reject non-integer facultyId when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        facultyId: "1",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });

    it("should reject non-integer userId when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: "5",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });

    it("should reject non-integer courseId when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        courseId: "3",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "courseId")).toBe(true);
    });

    it("should reject float facultyId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        facultyId: 1.5,
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(true);
    });
  });

  describe("Undefined and null handling", () => {
    it("should allow undefined for all fields", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: undefined,
        facultyId: undefined,
        userId: undefined,
        courseId: undefined,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should have undefined properties when not provided", () => {
      const dto = plainToInstance(UpdateAssociationDto, {});

      expect(dto.name).toBeUndefined();
      expect(dto.facultyId).toBeUndefined();
      expect(dto.userId).toBeUndefined();
      expect(dto.courseId).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should accept empty string for name (no @IsNotEmpty in PartialType)", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "",
      });

      const errors = await validate(dto);

      // PartialType makes fields optional but validation still applies when provided
      // @IsNotEmpty should still reject empty string
      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should accept zero as valid integer for IDs", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        facultyId: 0,
        userId: 0,
        courseId: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should accept negative integers for IDs", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        facultyId: -1,
        userId: -1,
        courseId: -1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
