import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { ProductLinkDto } from "@/products/dto/product-link.dto";

@Entity()
export class Product {
  /**
   * The unique identifier (UUID) of the product.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * The product title.
   * @example 'TimeTable Selector'
   */
  @Column()
  title: string;

  /**
   * The product description.
   * @example 'O TimeTable Selector (TTS) é uma plataforma desenvolvida pelo NIFEUP onde os estudantes podem experimentar as possíveis combinações de horários que podem escolher no início de cada semestre.'
   */
  @Column()
  description: string;

  /**
   * A short tagline for the product.
   * @example 'Planeia o teu semestre perfeito.'
   */
  @Column({ nullable: true })
  slogan?: string;

  /**
   * Who the product is aimed at.
   * @example 'Comunidade Académica da Universidade do Porto'
   */
  @Column({ nullable: true })
  targetAudience?: string;

  /**
   * Links related to the product, such as its social pages or the technologies it uses.
   */
  @Column({ type: "simple-json", nullable: true })
  links?: ProductLinkDto[];

  /**
   * The product logo.
   * @example '/api_images/projects/tts_logo.png'
   */
  @Column({ nullable: true })
  image?: string;

  /**
   * The image shown when the product is listed.
   * @example '/api_images/projects/tts_screenshot.png'
   */
  @Column({ nullable: true })
  thumbnail?: string;

  /**
   * Whether the product is archived.
   * @example false
   */
  @Column({ default: false })
  isArchived: boolean;

  /**
   * The images in the product gallery.
   * @example ['/api_images/projects/tts_screenshot.png']
   */
  @Column({ type: "simple-json", nullable: true })
  gallery?: string[];

  @ManyToOne(
    () => Association,
    (association) => association.products,
    { nullable: false, onDelete: "CASCADE" },
  )
  createdBy: Association;
}
