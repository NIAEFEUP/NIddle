import { validate } from "class-validator";
import { RequestAction, RequestType } from "@/requests/entities/request.entity";
import { CreateRequestDto } from "./create-request.dto";

describe("CreateRequestDto validation", () => {
  it("requires a type", async () => {
    const dto = new CreateRequestDto();
    dto.action = RequestAction.CREATE;
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "type")).toBe(true);
  });

  it("requires an action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "action")).toBe(true);
  });

  it("requires a payload for a Create action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.EVENT;
    dto.action = RequestAction.CREATE;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "payload")).toBe(true);
  });

  it("passes when type, action and payload are all provided for a Create action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.CREATE;
    dto.payload = {
      name: "Papelaria D. Beatriz",
      location: "B-142",
      schedule: [],
    };

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("does not require targetId for a Create action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.CREATE;
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "targetId")).toBe(false);
  });

  it("requires targetId for an Update Existing action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.UPDATE_EXISTING;
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "targetId")).toBe(true);
  });

  it("passes when targetId and payload are provided for an Update Existing action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.UPDATE_EXISTING;
    dto.targetId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
    dto.payload = { name: "Papelaria D. Beatriz" };

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("requires targetId for a Delete Existing action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.DELETE_EXISTING;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "targetId")).toBe(true);
  });

  it("does not require a payload for a Delete Existing action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.DELETE_EXISTING;
    dto.targetId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "payload")).toBe(false);
  });

  it("passes when only type, action and targetId are provided for a Delete Existing action", async () => {
    const dto = new CreateRequestDto();
    dto.type = RequestType.SERVICE;
    dto.action = RequestAction.DELETE_EXISTING;
    dto.targetId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
