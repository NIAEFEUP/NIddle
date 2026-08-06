import { plainToInstance } from "class-transformer";
import { UpdateRequestDto } from "./update-request.dto";

describe("UpdateRequestDto transformation", () => {
  it("transforms eventPayload into an UpdateEventDto instance", () => {
    const plain = {
      eventPayload: { name: "FEUP Week Updated" },
    };

    const dto = plainToInstance(UpdateRequestDto, plain);

    expect(dto.eventPayload).toBeDefined();
    expect(dto.eventPayload?.name).toEqual("FEUP Week Updated");
  });

  it("transforms servicePayload into an UpdateServiceDto instance", () => {
    const plain = {
      servicePayload: { name: "Papelaria Editada" },
    };

    const dto = plainToInstance(UpdateRequestDto, plain);

    expect(dto.servicePayload).toBeDefined();
    expect(dto.servicePayload?.name).toEqual("Papelaria Editada");
  });
});
