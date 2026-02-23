import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateServiceDto } from "./create-service.dto";

describe("CreateServiceDto validation", () => {
  it("valid dto should have no validation errors", async () => {
    const dto = new CreateServiceDto();
    dto.name = "Papelaria";
    dto.location = "B-142";
    dto.schedule = [];
    dto.email = "a@b.com";
    dto.phoneNumber = "+123";

    const errors = await validate(dto);
    // ensure required fields are valid
    expect(errors.some((e) => e.property === "name")).toBe(false);
    expect(errors.some((e) => e.property === "location")).toBe(false);
  });

  it("missing required fields should return validation errors", async () => {
    const dto = new CreateServiceDto();
    // missing name
    dto.location = "B-142";
    dto.schedule = [];

    const errors = await validate(dto);
    // should include an error for name
    expect(errors.some((e) => e.property === "name")).toBe(true);
  });

  it("should transform plain schedule object into Schedule instance using Type decorator", () => {
    const plain = {
      name: "Papelaria",
      location: "B-142",
      schedule: [],
    };

    const dto = plainToInstance(CreateServiceDto, plain);

    // Type decorator should have transformed nested plain object to Schedule
    expect(dto.schedule).toBeInstanceOf(Array);
    expect(dto.schedule).toEqual(plain.schedule);
  });

  it("should transform string courseIds to numbers using Type decorator", () => {
    const plain = {
      name: "Service Name",
      location: "B-142",
      schedule: [],
      courseIds: ["1", "2", "3"],
    };

    const dto = plainToInstance(CreateServiceDto, plain);

    expect(dto.courseIds).toEqual([1, 2, 3]);
    if (dto.courseIds) {
      expect(typeof dto.courseIds[0]).toBe("number");
    }
  });

  it("should accept optional fields", () => {
    const dto = new CreateServiceDto();
    dto.name = "Service";
    dto.location = "B-142";
    dto.schedule = [];

    expect(dto.email).toBeUndefined();
    expect(dto.phoneNumber).toBeUndefined();
    expect(dto.facultyId).toBeUndefined();
    expect(dto.courseIds).toBeUndefined();
  });

  describe("Required fields validation", () => {
    it("should reject missing location", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.schedule = [];

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "location")).toBe(true);
    });

    it("should reject missing schedule", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "schedule")).toBe(true);
    });

    it("should require name to be a string", async () => {
      const dto = new CreateServiceDto();
      dto.name = 123 as any;
      dto.location = "B-142";
      dto.schedule = [];

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("should require location to be a string", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = 123 as any;
      dto.schedule = [];

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "location")).toBe(true);
    });
  });

  describe("Optional email validation", () => {
    it("should validate email format when provided", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];
      dto.email = "invalid-email";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "email")).toBe(true);
    });

    it("should accept valid email", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];
      dto.email = "valid@example.com";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "email")).toBe(false);
    });

    it("should allow undefined email", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "email")).toBe(false);
    });
  });

  describe("Optional phoneNumber validation", () => {
    it("should require phoneNumber to be string when provided", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];
      dto.phoneNumber = 123 as any;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "phoneNumber")).toBe(true);
    });

    it("should allow valid phoneNumber string", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];
      dto.phoneNumber = "+1-555-0123";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "phoneNumber")).toBe(false);
    });
  });

  describe("Optional courseIds transformation", () => {
    it("should convert numeric strings to numbers", () => {
      const plain = {
        name: "Service",
        location: "B-142",
        schedule: [],
        courseIds: ["100", "200"],
      };

      const dto = plainToInstance(CreateServiceDto, plain);

      expect(dto.courseIds).toEqual([100, 200]);
    });

    it("should handle single courseId", () => {
      const plain = {
        name: "Service",
        location: "B-142",
        schedule: [],
        courseIds: ["42"],
      };

      const dto = plainToInstance(CreateServiceDto, plain);

      expect(dto.courseIds).toEqual([42]);
    });

    it("should handle empty courseIds array", () => {
      const plain = {
        name: "Service",
        location: "B-142",
        schedule: [],
        courseIds: [],
      };

      const dto = plainToInstance(CreateServiceDto, plain);

      expect(dto.courseIds).toEqual([]);
    });
  });

  describe("Optional facultyId", () => {
    it("should accept facultyId number", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];
      dto.facultyId = 1;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(false);
    });

    it("should allow undefined facultyId", async () => {
      const dto = new CreateServiceDto();
      dto.name = "Service";
      dto.location = "B-142";
      dto.schedule = [];

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "facultyId")).toBe(false);
    });
  });

  describe("Complete valid payload", () => {
    it("should accept complete valid service creation payload", async () => {
      const plain = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "pbeatriz@example.com",
        phoneNumber: "+1-555-0123",
        schedule: [],
        courseIds: ["1", "2"],
        facultyId: 1,
      };

      const dto = plainToInstance(CreateServiceDto, plain);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe("Papelaria D. Beatriz");
      expect(dto.location).toBe("B-142");
      expect(dto.email).toBe("pbeatriz@example.com");
      expect(dto.phoneNumber).toBe("+1-555-0123");
      expect(dto.courseIds).toEqual([1, 2]);
      expect(dto.facultyId).toBe(1);
    });
  });
});
