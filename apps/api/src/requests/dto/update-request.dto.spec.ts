import { validate } from "class-validator";
import { UpdateRequestDto } from "./update-request.dto";

describe("UpdateRequestDto validation", () => {
  it("requires a payload", async () => {
    const dto = new UpdateRequestDto();

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "payload")).toBe(true);
  });

  it("passes when a payload is provided", async () => {
    const dto = new UpdateRequestDto();
    dto.payload = { name: "Papelaria Editada" };

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
