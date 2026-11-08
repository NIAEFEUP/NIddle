import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateProductDto } from "./update-product.dto";

describe("UpdateProductDto", () => {
  const errorProperties = async (plain: object) => {
    const dto = plainToInstance(UpdateProductDto, plain);
    const errors = await validate(dto);
    return errors.map((e) => e.property);
  };

  it("accepts an empty payload", async () => {
    expect(await errorProperties({})).toEqual([]);
  });

  it("accepts a partial payload", async () => {
    expect(await errorProperties({ title: "New title" })).toEqual([]);
  });

  it("still rejects invalid values", async () => {
    expect(await errorProperties({ title: "" })).toContain("title");
  });

  it.each([
    "links",
    "technologies",
  ])("still validates the items in %s", async (field) => {
    expect(
      await errorProperties({
        [field]: [{ label: "GitHub", url: "not a url" }],
      }),
    ).toContain(field);
  });
});
