import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

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
   * The icon shown next to the link.
   * @example '/api_images/projects/tts_logo.png'
   */
  @IsString()
  @IsOptional()
  iconPath?: string;
}
