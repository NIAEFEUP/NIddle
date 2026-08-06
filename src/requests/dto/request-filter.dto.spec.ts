import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestFilterDto } from "./request-filter.dto";

describe("RequestFilterDto transformation", () => {
  it("transforms a numeric string requestedBy into a number", () => {
    const dto = plainToInstance(RequestFilterDto, { requestedBy: "9" });

    expect(dto.requestedBy).toEqual(9);
    expect(typeof dto.requestedBy).toBe("number");
  });

  it("rejects a non-numeric requestedBy", async () => {
    const dto = plainToInstance(RequestFilterDto, { requestedBy: "abc" });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "requestedBy")).toBe(true);
  });

  it("is valid when no filters are provided", async () => {
    const dto = plainToInstance(RequestFilterDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
