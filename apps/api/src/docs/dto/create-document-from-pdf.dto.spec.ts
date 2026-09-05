import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateDocumentFromPdfDto } from "@/docs/dto/create-document-from-pdf.dto";

describe("CreateDocumentFromPdfDto", () => {
  it("accepts an empty payload (fields optional when uploading pdf)", async () => {
    const dto = plainToInstance(CreateDocumentFromPdfDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("validates valid fields and transforms isPublished", async () => {
    const plain = {
      title: "Student Handbook",
      subtitle: "2026 Edition",
      slug: "student-handbook",
      isPublished: "true",
      changeSummary: "Initial PDF release",
    };

    const dto = plainToInstance(CreateDocumentFromPdfDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.isPublished).toBe(true);
    expect(dto.title).toBe("Student Handbook");
  });

  it("rejects invalid slug format", async () => {
    const plain = {
      slug: "INVALID SLUG!",
    };

    const dto = plainToInstance(CreateDocumentFromPdfDto, plain);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "slug")).toBe(true);
  });
});
