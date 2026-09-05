import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DocumentSectionDto } from "@/docs/dto/document-section.dto";

describe("DocumentSectionDto", () => {
  it("validates a simple valid section", async () => {
    const plain = {
      title: "Introduction",
      content: "Welcome to **NIddle**.",
      order: 1,
    };

    const dto = plainToInstance(DocumentSectionDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.title).toBe("Introduction");
    expect(dto.content).toBe("Welcome to **NIddle**.");
  });

  it("validates nested sections recursively", async () => {
    const plain = {
      title: "1. Parent Section",
      content: "Parent content",
      order: 1,
      sections: [
        {
          title: "1.1 Child Subsection",
          content: "Child *rich* content",
          order: 1,
          sections: [
            {
              title: "1.1.1 Grandchild Subsection",
              content: "Grandchild content",
            },
          ],
        },
      ],
    };

    const dto = plainToInstance(DocumentSectionDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.sections?.[0].title).toBe("1.1 Child Subsection");
    expect(dto.sections?.[0].sections?.[0].title).toBe(
      "1.1.1 Grandchild Subsection",
    );
  });

  it("rejects empty title", async () => {
    const plain = {
      title: "",
      content: "Some content",
    };

    const dto = plainToInstance(DocumentSectionDto, plain);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "title")).toBe(true);
  });
});
