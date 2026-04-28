import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { FacultyTranslation } from "@/i18n/entities";

@Entity()
export class Faculty {
  /**
   * The unique identifier of the faculty.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The default language for this faculty's translations.
   * @example "en"
   */
  @Column({ name: "default_language", length: 10, default: "en" })
  defaultLanguage: string;

  /**
   * Translations for the faculty name and acronym.
   */
  @OneToMany(
    () => FacultyTranslation,
    (translation) => translation.faculty,
    { cascade: true },
  )
  translations: FacultyTranslation[];

  /**
   * The courses associated with this faculty.
   */
  @ManyToMany(
    () => Course,
    (course) => course.faculties,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinTable()
  courses: Course[];

  /**
   * Events associated with this faculty.
   */
  @OneToMany(
    () => Event,
    (event) => event.faculty,
  )
  events: Event[];
}
