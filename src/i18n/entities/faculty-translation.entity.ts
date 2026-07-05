import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Faculty } from "@/faculties/entities/faculty.entity";

@Entity()
export class FacultyTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "faculty_id" })
  facultyId: number;

  /**
   * The language code for this translation.
   * @example "en"
   */
  @Column({ name: "language_code", length: 10 })
  languageCode: string;

  /**
   * The faculty name in this language.
   * @example "Faculty of Engineering"
   */
  @Column()
  name: string;

  /**
   * The faculty acronym in this language.
   * @example "FEUP"
   */
  @Column({ length: 20 })
  acronym: string;

  @ManyToOne(
    () => Faculty,
    (faculty) => faculty.translations,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "faculty_id" })
  faculty: Faculty;
}
