import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateDocumentDto } from "@/docs/dto/create-document.dto";

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  /**
   * Explanation for why this legal document was edited (recorded in history).
   * @example 'Updated clause 4 to reflect GDPR data retention policy'
   */
  @ApiPropertyOptional({
    description: "Audit reason for this legal update",
    example: "Updated clause 4 to reflect GDPR data retention policy",
  })
  @IsOptional()
  @IsString()
  changeSummary?: string;
}
