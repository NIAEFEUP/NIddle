import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class CreateDocumentFromPdfDto {
  /**
   * Title of the document. If omitted, it will be automatically derived from the PDF filename.
   * @example 'Terms of Service'
   */
  @ApiPropertyOptional({
    description:
      "Document title. If not provided, it is automatically derived from the PDF filename.",
    example: "Terms of Service",
  })
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Optional subtitle or preamble of the document.
   * @example 'Effective as of September 2026'
   */
  @ApiPropertyOptional({
    description: "Subtitle or preamble of the document",
    example: "Effective as of September 2026",
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  /**
   * Unique URL-friendly slug. If omitted, will be generated from title or filename.
   * @example 'terms-of-service'
   */
  @ApiPropertyOptional({
    description:
      "URL-friendly slug. If omitted, generated from title or filename.",
    example: "terms-of-service",
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug?: string;

  /**
   * Brief description or summary of the document.
   * @example 'PDF copy of legal terms'
   */
  @ApiPropertyOptional({
    description: "Brief summary or meta description",
    example: "PDF copy of legal terms",
  })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Summary of change or reason for this submission.
   * @example 'Uploaded official PDF version'
   */
  @ApiPropertyOptional({
    description: "Audit change summary for this initial PDF revision",
    example: "Uploaded official PDF document",
  })
  @IsOptional()
  @IsString()
  changeSummary?: string;

  /**
   * Whether this document is published and publicly accessible.
   * @example true
   */
  @ApiPropertyOptional({
    description: "Whether the document is publicly published",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return undefined;
  })
  isPublished?: boolean;

  /**
   * Date on which this legal document takes effect.
   * @example '2026-09-01T00:00:00.000Z'
   */
  @ApiPropertyOptional({
    description: "Effective date of the legal document",
    example: "2026-09-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;
}
