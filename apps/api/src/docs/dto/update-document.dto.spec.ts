import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateDocumentDto } from "@/docs/dto/update-document.dto";

describe("UpdateDocumentDto", () => {
  it("accepts partial updates", async () => {
    const plain = {
      subtitle: "Updated subtitle",
      changeSummary: "Reason for edit",
    };

    const dto = plainToInstance(UpdateDocumentDto, plain);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.subtitle).toBe("Updated subtitle");
    expect(dto.changeSummary).toBe("Reason for edit");
  });
});
