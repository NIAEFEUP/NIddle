import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DocumentFilterDto } from "@/docs/dto/document-filter.dto";

describe("DocumentFilterDto", () => {
  it("transforms string booleans properly", async () => {
    const plain = {
      isPublished: "true",
      page: "2",
      limit: "5",
      search: "terms",
    };

    const dto = plainToInstance(DocumentFilterDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.isPublished).toBe(true);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
    expect(dto.search).toBe("terms");
  });
});
