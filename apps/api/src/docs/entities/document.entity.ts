import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DocumentSectionDto } from "@/docs/dto/document-section.dto";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

@Entity("documents")
export class Document {
  /**
   * The unique identifier (UUID) of the document.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * Unique URL-friendly slug used to access the document at /api/docs/<slug>.
   * @example 'terms-of-service'
   */
  @Index({ unique: true })
  @Column({ unique: true })
  slug: string;

  /**
   * Title of the document.
   * @example 'Terms of Service'
   */
  @Column()
  title: string;

  /**
   * Optional subtitle or preamble of the document.
   * @example 'Effective as of September 2026'
   */
  @Column({ type: "varchar", nullable: true })
  subtitle: string | null;

  /**
   * Short summary or meta description of the document.
   * @example 'Terms and conditions for using the NIddle platform'
   */
  @Column({ type: "varchar", nullable: true })
  description: string | null;

  /**
   * Hierarchical sections with rich formatted content.
   */
  @Column({ type: "simple-json", default: "[]" })
  sections: DocumentSectionDto[];

  /**
   * Internal relative path of uploaded PDF file.
   * @example 'doc-1725555555.pdf'
   */
  @Column({ type: "varchar", nullable: true })
  pdfPath: string | null;

  /**
   * Original filename of the uploaded PDF.
   * @example 'terms-of-service-v2.pdf'
   */
  @Column({ type: "varchar", nullable: true })
  pdfOriginalName: string | null;

  /**
   * MIME type of uploaded PDF.
   * @example 'application/pdf'
   */
  @Column({ type: "varchar", nullable: true })
  pdfMimeType: string | null;

  /**
   * File size of uploaded PDF in bytes.
   * @example 1048576
   */
  @Column({ type: "int", nullable: true })
  pdfSize: number | null;

  /**
   * Current revision number of the document (starts at 1 and increments with every edit).
   * @example 1
   */
  @Column({ type: "int", default: 1 })
  version: number;

  /**
   * Whether the document is published and publicly accessible.
   * @example true
   */
  @Column({ type: "boolean", default: true })
  isPublished: boolean;

  /**
   * Legal effective date of the document.
   * @example '2026-09-01T00:00:00.000Z'
   */
  @Column({ type: Date, nullable: true })
  effectiveDate: Date | null;

  /**
   * Description of the most recent modification.
   * @example 'Updated section 2 regarding cookies'
   */
  @Column({ type: "varchar", nullable: true })
  changeSummary: string | null;

  /**
   * User who performed the latest edit.
   */
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  author: User | null;

  /**
   * Complete historical audit trail of revisions since creation.
   */
  @OneToMany(
    () => DocumentHistory,
    (history) => history.document,
    { cascade: true, onDelete: "CASCADE" },
  )
  history: DocumentHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial?: Partial<Document>) {
    Object.assign(this, partial);
  }
}
