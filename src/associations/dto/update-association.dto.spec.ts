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

    it("should allow updating only acronym", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        acronym: "UCN",
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.acronym).toBe("UCN");
    });

    it("should allow updating only userId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: 10,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.userId).toBe(10);
    });
  });

  describe("Updating multiple fields", () => {
    it("should allow updating multiple fields at once", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "New Club Name",
        acronym: "NCN",
        userId: 15,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("New Club Name");
      expect(dto.acronym).toBe("NCN");
      expect(dto.userId).toBe(15);
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

    it("should reject non-string acronym when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        acronym: 123,
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "acronym")).toBe(true);
    });

    it("should reject non-integer userId when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: "5",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });

    it("should reject float userId", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: 5.5,
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "userId")).toBe(true);
    });
  });

  describe("Undefined and null handling", () => {
    it("should allow undefined for all fields", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: undefined,
        acronym: undefined,
        userId: undefined,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should have undefined properties when not provided", () => {
      const dto = plainToInstance(UpdateAssociationDto, {});

      expect(dto.name).toBeUndefined();
      expect(dto.acronym).toBeUndefined();
      expect(dto.userId).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should reject empty string for name when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        name: "",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should accept empty string for acronym when provided", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        acronym: "",
      });

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "acronym")).toBe(false);
    });

    it("should accept zero as valid integer for IDs", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it("should accept negative integers for IDs", async () => {
      const dto = plainToInstance(UpdateAssociationDto, {
        userId: -1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
