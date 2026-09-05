import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UploadPdfDto {
  /**
   * Audit summary explaining the PDF upload.
   * @example 'Uploaded officially signed PDF of Terms of Service'
   */
  @ApiPropertyOptional({
    description: "Audit change summary for this PDF upload",
    example: "Uploaded signed PDF copy",
  })
  @IsOptional()
  @IsString()
  changeSummary?: string;
}
