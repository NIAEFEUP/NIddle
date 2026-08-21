import { validate } from "class-validator";
import { RequestType } from "@/requests/entities/request.entity";
import { CreateRequestDto } from "./create-request.dto";

describe("CreateRequestDto validation", () => {
  it("requires a type", async () => {
    const dto = new CreateRequestDto();
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "type")).toBe(true);
  });

  it("requires a payload", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.EVENT;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "payload")).toBe(true);
  });

  it("passes when type and payload are both provided", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.payload = {
      name: "Papelaria D. Beatriz",
      location: "B-142",
      schedule: [],
    };

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("does not require targetId", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "targetId")).toBe(false);
  });
});
