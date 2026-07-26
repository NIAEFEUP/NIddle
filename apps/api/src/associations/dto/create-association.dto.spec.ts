import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateAssociationDto } from "./create-association.dto";

describe("CreateAssociationDto", () => {
  describe("Valid DTO", () => {
    it("should have no validation errors with valid required fields", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should accept complete valid payload using plainToInstance", async () => {
      const plain = {
        name: "Photography Club",
        acronym: "PC",
      };

      const dto = plainToInstance(CreateAssociationDto, plain);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("Photography Club");
      expect(dto.acronym).toBe("PC");
    });

    it("should accept DTO without optional acronym", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "acronym")).toBe(false);
    });
  });

  describe("Required fields validation", () => {
    it("should reject missing name", async () => {
      const dto = new CreateAssociationDto();

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should reject empty name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });
  });

  describe("Type validation", () => {
    it("should reject non-string name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = 123 as any;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should reject non-string acronym when provided", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.acronym = 123 as any;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "acronym")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should accept long name", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "A".repeat(500);

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(false);
    });

    it("should accept long acronym when provided", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "Chess Club";
      dto.acronym = "A".repeat(500);

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "acronym")).toBe(false);
    });

    it("should accept whitespace-only name as not empty", async () => {
      const dto = new CreateAssociationDto();
      dto.name = "   ";

      const errors = await validate(dto);

      // @IsNotEmpty checks for empty string, whitespace is not empty
      expect(errors.some((e) => e.property === "name")).toBe(false);
    });
  });
});
