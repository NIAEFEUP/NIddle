import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestType } from "@/requests/entities/request.entity";
import { CreateRequestDto } from "./create-request.dto";

describe("CreateRequestDto validation", () => {
  it("requires eventPayload when type is Event", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.EVENT;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "eventPayload")).toBe(true);
    expect(errors.some((e) => e.property === "servicePayload")).toBe(false);
  });

  it("requires servicePayload when type is Service", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "servicePayload")).toBe(true);
    expect(errors.some((e) => e.property === "eventPayload")).toBe(false);
  });

  it("does not require eventPayload when a servicePayload is provided", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.servicePayload = {
      name: "Papelaria D. Beatriz",
      location: "B-142",
      schedule: [],
    } as any;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "eventPayload")).toBe(false);
  });

  it("transforms eventPayload into a CreateEventDto instance", () => {
    const plain = {
      type: RequestType.EVENT,
      eventPayload: { name: "FEUP Week", year: 2025 },
    };

    const dto = plainToInstance(CreateRequestDto, plain);

    expect(dto.eventPayload).toBeDefined();
    expect(dto.eventPayload?.name).toEqual("FEUP Week");
  });

  it("transforms servicePayload into a CreateServiceDto instance", () => {
    const plain = {
      type: RequestType.SERVICE,
      servicePayload: {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        schedule: [],
      },
    };

    const dto = plainToInstance(CreateRequestDto, plain);

    expect(dto.servicePayload).toBeDefined();
    expect(dto.servicePayload?.name).toEqual("Papelaria D. Beatriz");
  });
});
