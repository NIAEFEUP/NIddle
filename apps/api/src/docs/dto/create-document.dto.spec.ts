import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateDocumentDto } from "@/docs/dto/create-document.dto";

describe("CreateDocumentDto", () => {
  it("accepts a valid payload", async () => {
    const plain = {
      title: "Terms of Service",
      subtitle: "Effective 2026",
      slug: "terms-of-service",
      isPublished: true,
      sections: [
        {
          title: "Introduction",
          content: "Some **content**",
        },
      ],
    };

    const dto = plainToInstance(CreateDocumentDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("rejects invalid slug format", async () => {
    const plain = {
      title: "Terms of Service",
      slug: "INVALID SLUG!",
    };

    const dto = plainToInstance(CreateDocumentDto, plain);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "slug")).toBe(true);
  });

  it("rejects missing title", async () => {
    const plain = {
      subtitle: "Sub",
    };

    const dto = plainToInstance(CreateDocumentDto, plain);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "title")).toBe(true);
  });
});
