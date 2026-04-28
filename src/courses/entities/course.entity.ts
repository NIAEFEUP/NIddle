import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CourseTranslation } from "@/i18n/entities";

@Entity()
export class Course {
  /**
   * The unique identifier of the course.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The default language for this course's translations.
   * @example "en"
   */
  @Column({ name: "default_language", length: 10, default: "en" })
  defaultLanguage: string;

  /**
   * Translations for the course name and acronym.
   */
  @OneToMany(
    () => CourseTranslation,
    (translation) => translation.course,
    { cascade: true },
  )
  translations: CourseTranslation[];

  /**
   * The faculties associated with this course.
   */
  @ManyToMany(
    () => Faculty,
    (faculty) => faculty.courses,
  )
  faculties: Faculty[];

  /**
   * Events associated with this course.
   */
  @ManyToMany(
    () => Event,
    (event) => event.courses,
  )
  events: Event[];
}
