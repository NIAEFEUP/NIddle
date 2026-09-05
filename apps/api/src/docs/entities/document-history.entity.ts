import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocumentSectionDto } from "@/docs/dto/document-section.dto";
import { Document } from "@/docs/entities/document.entity";
import { User } from "@/users/entities/user.entity";

@Entity("document_history")
export class DocumentHistory {
  /**
   * The unique identifier (UUID) of the history snapshot.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * Foreign key UUID of parent document.
   */
  @Index()
  @Column()
  documentId: string;

  /**
   * Parent document this history snapshot belongs to.
   */
  @ManyToOne(
    () => Document,
    (document) => document.history,
    { onDelete: "CASCADE" },
  )
  document: Document;

  /**
   * Version number of this snapshot.
   * @example 1
   */
  @Column({ type: "int" })
  version: number;

  /**
   * Document title at this version.
   * @example 'Terms of Service'
   */
  @Column()
  title: string;

  /**
   * Subtitle at this version.
   * @example 'Effective September 2026'
   */
  @Column({ type: "varchar", nullable: true })
  subtitle: string | null;

  /**
   * Description at this version.
   * @example 'Terms governing platform use'
   */
  @Column({ type: "varchar", nullable: true })
  description: string | null;

  /**
   * Sections snapshot at this version.
   */
  @Column({ type: "simple-json", default: "[]" })
  sections: DocumentSectionDto[];

  /**
   * Uploaded PDF relative path at this version.
   */
  @Column({ type: "varchar", nullable: true })
  pdfPath: string | null;

  /**
   * Uploaded PDF original filename at this version.
   */
  @Column({ type: "varchar", nullable: true })
  pdfOriginalName: string | null;

  /**
   * Uploaded PDF MIME type at this version.
   */
  @Column({ type: "varchar", nullable: true })
  pdfMimeType: string | null;

  /**
   * Uploaded PDF size in bytes at this version.
   */
  @Column({ type: "int", nullable: true })
  pdfSize: number | null;

  /**
   * Audit log change summary explaining this revision.
   * @example 'Updated Section 2'
   */
  @Column({ type: "varchar", nullable: true })
  changeSummary: string | null;

  /**
   * User who authored this revision.
   */
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  author: User | null;

  /**
   * Snapshot of author email.
   * @example 'admin@example.com'
   */
  @Column({ type: "varchar", nullable: true })
  authorEmail: string | null;

  /**
   * Whether document was published at this version.
   */
  @Column({ type: "boolean", default: true })
  isPublished: boolean;

  /**
   * Legal effective date at this version.
   */
  @Column({ type: Date, nullable: true })
  effectiveDate: Date | null;

  /**
   * Timestamp when this version was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  constructor(partial?: Partial<DocumentHistory>) {
    Object.assign(this, partial);
  }
}
