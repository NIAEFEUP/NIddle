import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class DocumentSectionDto {
  /**
   * Optional unique identifier or anchor slug for this section.
   * @example 'acceptance-of-terms'
   */
  @ApiPropertyOptional({
    description: "Anchor identifier for linking directly to this section",
    example: "acceptance-of-terms",
  })
  @IsOptional()
  @IsString()
  id?: string;

  /**
   * Title or heading of the section.
   * @example '1. Acceptance of Terms'
   */
  @ApiProperty({
    description: "Title or heading of the section",
    example: "1. Acceptance of Terms",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * Rich formatted content supporting bold, italics, links, and markdown syntax.
   * @example 'By accessing or using **NIddle**, you agree to be bound by these Terms.'
   */
  @ApiPropertyOptional({
    description:
      "Rich formatted text content (supports Markdown such as **bold**, *italics*, bullet lists, etc.)",
    example:
      "By accessing or using **NIddle**, you agree to be bound by these *Terms*.",
  })
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * Display order among sibling sections.
   * @example 1
   */
  @ApiPropertyOptional({
    description: "Display ordering weight for sorting sections",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  order?: number;

  /**
   * Nested subsections within this section.
   */
  @ApiPropertyOptional({
    description: "Nested subsections (recursive hierarchy)",
    type: () => [DocumentSectionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentSectionDto)
  sections?: DocumentSectionDto[];
}
