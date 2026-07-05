import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";

@Entity()
export class CourseTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "course_id" })
  courseId: number;

  /**
   * The language code for this translation.
   * @example "en"
   */
  @Column({ name: "language_code", length: 10 })
  languageCode: string;

  /**
   * The course name in this language.
   * @example "Computer Science"
   */
  @Column()
  name: string;

  /**
   * The course acronym in this language.
   * @example "CS"
   */
  @Column({ length: 20 })
  acronym: string;

  @ManyToOne(
    () => Course,
    (course) => course.translations,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "course_id" })
  course: Course;
}
