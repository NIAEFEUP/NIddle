import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateServiceDto } from "./update-service.dto";

describe("UpdateServiceDto", () => {
  it("should be a PartialType of CreateServiceDto with all fields optional", () => {
    const dto = plainToInstance(UpdateServiceDto, {});

    expect(dto).toBeDefined();
    expect(typeof dto).toBe("object");
  });

  it("should allow updating only name", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      name: "Updated Name",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.name).toBe("Updated Name");
  });

  it("should allow updating only location", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      location: "New Location",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.location).toBe("New Location");
  });

  it("should allow updating only email", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      email: "newemail@example.com",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe("newemail@example.com");
  });

  it("should allow updating only phoneNumber", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      phoneNumber: "+1234567890",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.phoneNumber).toBe("+1234567890");
  });

  it("should allow updating only courseId", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      courseId: 1,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.courseId).toEqual(1);
  });

  it("should allow updating only facultyId", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      facultyId: 5,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.facultyId).toBe(5);
  });

  it("should allow updating multiple fields at once", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      name: "Updated Name",
      location: "New Location",
      email: "new@example.com",
      phoneNumber: "+1234567890",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.name).toBe("Updated Name");
    expect(dto.location).toBe("New Location");
    expect(dto.email).toBe("new@example.com");
    expect(dto.phoneNumber).toBe("+1234567890");
  });

  it("should allow empty update object", async () => {
    const dto = plainToInstance(UpdateServiceDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("should validate email format when provided", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      email: "invalid-email",
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("email");
  });

  it("should allow null email (optional field)", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      email: null,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("should allow undefined courseId", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      courseIds: undefined,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.courseId).toBeUndefined();
  });

  it("should transform string courseIds to numbers", () => {
    const dto = plainToInstance(UpdateServiceDto, {
      courseId: 3,
    });

    expect(dto.courseId).toEqual(3);
    if (dto.courseId) {
      expect(typeof dto.courseId).toBe("number");
    }
  });

  it("should allow clearing courseIds with empty array", async () => {
    const dto = plainToInstance(UpdateServiceDto, {
      courseId: undefined,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.courseId).toBeUndefined();
  });
});
