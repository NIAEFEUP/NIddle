import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ProductLinkDto } from "./product-link.dto";

export class CreateProductDto {
  /**
   * The product title.
   * @example 'TimeTable Selector'
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * The product description.
   * @example 'O TimeTable Selector (TTS) é uma plataforma desenvolvida pelo NIFEUP onde os estudantes podem experimentar as possíveis combinações de horários que podem escolher no início de cada semestre.'
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * The URL-friendly identifier of the product.
   * @example 'timetable-selector'
   */
  @IsString()
  @IsOptional()
  slug?: string;

  /**
   * A short tagline for the product.
   * @example 'Planeia o teu semestre perfeito.'
   */
  @IsString()
  @IsOptional()
  slogan?: string;

  /**
   * Who the product is aimed at.
   * @example 'Comunidade Académica da Universidade do Porto'
   */
  @IsString()
  @IsOptional()
  targetAudience?: string;

  /**
   * Links related to the product, such as its repository, website or app store pages.
   * @example [{"label": "GitHub", "url": "https://github.com/niaefeup/uni"}]
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductLinkDto)
  @IsOptional()
  links?: ProductLinkDto[];

  /**
   * The product logo.
   * @example '/api_images/projects/tts_logo.png'
   */
  @IsString()
  @IsOptional()
  image?: string;

  /**
   * The image shown when the product is listed.
   * @example '/api_images/projects/tts_screenshot.png'
   */
  @IsString()
  @IsOptional()
  thumbnail?: string;

  /**
   * Whether the product is archived.
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  /**
   * The images in the product gallery.
   * @example ['/api_images/projects/tts_screenshot.png']
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  /**
   * The technologies used to build the product.
   * @example [{"label": "Flutter", "url": "https://flutter.dev"}]
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductLinkDto)
  @IsOptional()
  technologies?: ProductLinkDto[];
}
