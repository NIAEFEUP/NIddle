import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export enum ProductLinkTag {
  SOCIAL = "Social",
  TECHNOLOGY = "Technology",
}

export class ProductLinkDto {
  /**
   * The text shown for the link.
   * @example 'GitHub'
   */
  @IsString()
  @IsNotEmpty()
  label: string;

  /**
   * The URL the link points to.
   * @example 'https://github.com/niaefeup/tts-fe'
   */
  @IsUrl()
  url: string;

  /**
   * The kind of link.
   * @example 'Social'
   */
  @IsEnum(ProductLinkTag)
  tag: ProductLinkTag;

  /**
   * The icon shown next to the link.
   * @example '/api_images/projects/tts_logo.png'
   */
  @IsString()
  @IsOptional()
  iconPath?: string;
}
