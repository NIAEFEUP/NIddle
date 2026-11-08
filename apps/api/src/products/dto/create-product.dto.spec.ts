import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateProductDto } from "./create-product.dto";

describe("CreateProductDto", () => {
  const required = {
    title: "TimeTable Selector",
    description: "A platform to plan semester timetables",
  };

  const errorProperties = async (plain: object) => {
    const dto = plainToInstance(CreateProductDto, plain);
    const errors = await validate(dto);
    return errors.map((e) => e.property);
  };

  describe("Required fields", () => {
    it("accepts only title and description", async () => {
      expect(await errorProperties(required)).toEqual([]);
    });

    it.each(["title", "description"])("rejects a missing %s", async (field) => {
      const { [field as keyof typeof required]: _omitted, ...rest } = required;

      expect(await errorProperties(rest)).toContain(field);
    });

    it.each(["title", "description"])("rejects an empty %s", async (field) => {
      expect(await errorProperties({ ...required, [field]: "" })).toContain(
        field,
      );
    });
  });

  describe.each(["links", "technologies"])("%s", (field) => {
    const validItem = { label: "React", url: "https://react.dev" };

    it("accepts an empty list", async () => {
      expect(await errorProperties({ ...required, [field]: [] })).toEqual([]);
    });

    it("accepts an item without iconPath", async () => {
      expect(
        await errorProperties({ ...required, [field]: [validItem] }),
      ).toEqual([]);
    });

    it("accepts an item with iconPath", async () => {
      expect(
        await errorProperties({
          ...required,
          [field]: [
            { ...validItem, iconPath: "/api_images/technologies/react.png" },
          ],
        }),
      ).toEqual([]);
    });

    it.each([
      ["a malformed url", { ...validItem, url: "not a url" }],
      ["a javascript: url", { ...validItem, url: "javascript:alert(1)" }],
      ["a missing url", { label: "React" }],
      ["a missing label", { url: validItem.url }],
      ["an empty label", { ...validItem, label: "" }],
      ["a non-string iconPath", { ...validItem, iconPath: 1 }],
    ])("rejects an item with %s", async (_case, item) => {
      expect(await errorProperties({ ...required, [field]: [item] })).toContain(
        field,
      );
    });

    it("rejects a string instead of a list", async () => {
      expect(
        await errorProperties({ ...required, [field]: "https://react.dev" }),
      ).toContain(field);
    });
  });

  describe("Other optional fields", () => {
    it("accepts a complete payload", async () => {
      expect(
        await errorProperties({
          ...required,
          slug: "timetable-selector",
          slogan: "Planeia o teu semestre perfeito.",
          targetAudience: "Comunidade Académica da Universidade do Porto",
          image: "/api_images/projects/tts_logo.png",
          thumbnail: "/api_images/projects/tts_screenshot.png",
          isArchived: true,
          gallery: ["/api_images/projects/tts_screenshot.png"],
        }),
      ).toEqual([]);
    });

    it("rejects a gallery that isn't a list of strings", async () => {
      expect(await errorProperties({ ...required, gallery: [1, 2] })).toContain(
        "gallery",
      );
    });

    it("rejects a non-boolean isArchived", async () => {
      expect(
        await errorProperties({ ...required, isArchived: "yes" }),
      ).toContain("isArchived");
    });
  });
});
