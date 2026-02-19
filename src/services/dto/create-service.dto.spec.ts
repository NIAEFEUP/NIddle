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
});
