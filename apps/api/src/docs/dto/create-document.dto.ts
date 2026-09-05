import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";
import { DocumentSectionDto } from "@/docs/dto/document-section.dto";

export class CreateDocumentDto {
  /**
   * Title of the document.
   * @example 'Terms of Service'
   */
  @ApiProperty({
    description: "Title of the legal document",
    example: "Terms of Service",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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
   * Unique URL-friendly slug. If not provided, it is auto-generated from title.
   * @example 'terms-of-service'
   */
  @ApiPropertyOptional({
    description:
      "URL-friendly slug. If omitted, will be generated automatically from the title.",
    example: "terms-of-service",
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug?: string;

  /**
   * Brief description / summary of the document.
   * @example 'Standard terms governing use of the NIddle platform'
   */
  @ApiPropertyOptional({
    description: "Brief summary or meta description",
    example: "Standard terms governing use of the NIddle platform",
  })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Hierarchical sections making up the document.
   */
  @ApiPropertyOptional({
    description: "Recursive sections and subsections of the document",
    type: () => [DocumentSectionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentSectionDto)
  sections?: DocumentSectionDto[];

  /**
   * Summary of change or reason for this submission.
   * @example 'Initial legal submission'
   */
  @ApiPropertyOptional({
    description: "Audit change summary for this document revision",
    example: "Initial publication of Terms of Service",
  })
  @IsOptional()
  @IsString()
  changeSummary?: string;

  /**
   * Whether this document is publicly published or a draft.
   * @example true
   */
  @ApiPropertyOptional({
    description: "Whether the document is published and publicly accessible",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
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
