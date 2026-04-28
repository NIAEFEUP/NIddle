import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { EventTranslation } from "@/i18n/entities";

@Entity()
export class Event {
  /**
   * The unique identifier of the event.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The default language for this event's translations.
   * @example "en"
   */
  @Column({ name: "default_language", length: 10, default: "en" })
  defaultLanguage: string;

  /**
   * Translations for the event name and description.
   */
  @OneToMany(
    () => EventTranslation,
    (translation) => translation.event,
    { cascade: true },
  )
  translations: EventTranslation[];

  /**
   * The year when the event occurs.
   * @example 2025
   */
  @Column({ type: "int" })
  year: number;

  /**
   * The start date and time of the event.
   * For single-day events, set this to the event date and leave endDate as null.
   * For period events, set both startDate and endDate.
   * For 'TBD' or 'until' events, this can be null.
   * @example '2025-12-26T09:00:00Z'
   */
  @Column({ type: Date, nullable: true })
  startDate?: Date | null;

  /**
   * The end date and time of the event.
   * For period events, set this to the end date.
   * For single-day events, leave this as null.
   * For 'until' events, set this to the deadline and leave startDate as null.
   * @example '2025-12-27T18:00:00Z'
   */
  @Column({ type: Date, nullable: true })
  endDate?: Date | null;

  /**
   * The faculty this event belongs to.
   */
  @ManyToOne(
    () => Faculty,
    (faculty) => faculty.events,
    { nullable: true },
  )
  faculty?: Faculty;

  /**
   * The courses associated with the event.
   */
  @ManyToMany(
    () => Course,
    (course) => course.events,
    { onDelete: "CASCADE" },
  )
  @JoinTable()
  courses: Course[];
}
