import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ProductLinkTag } from "./product-link.dto";
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
    "title",
    "description",
    "isArchived",
  ])("rejects a null %s", async (field) => {
    expect(await errorProperties({ [field]: null })).toContain(field);
  });

  it("still accepts a null for nullable fields", async () => {
    expect(await errorProperties({ slogan: null })).toEqual([]);
  });

  it.each([
    ["url", { label: "GitHub", url: "not a url", tag: ProductLinkTag.SOCIAL }],
    ["tag", { label: "GitHub", url: "https://github.com/niaefeup" }],
  ])("still validates the %s of each link", async (_field, item) => {
    expect(await errorProperties({ links: [item] })).toContain("links");
  });
});
