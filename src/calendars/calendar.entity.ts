import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Faculty } from '../faculties/faculty.entity';
import { Event } from '../events/event.entity';

@Entity()
export class Calendar {
  /**
   * The unique identifier of the calendar.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The calendar name.
   * @example 'FEUP 2025/2026 Academic Calendar'
   */
  @Column()
  name: string;

  /**
   * The calendar description.
   * @example 'Calendar for the 2025/2026 Academic Calendar at the Faculty of Engineering of the University of Porto'
   */
  @Column({ nullable: true })
  description: string;

  /**
   * The calendar year.
   * @example '2025'
   */
  @Column({ type: 'int' })
  year: number;

  /**
   * The faculties associated with this calendar.
   * Many faculties can be linked to many calendars.
   */
  @ManyToMany(() => Faculty, (faculty) => faculty.calendars)
  @JoinTable()
  faculties: Faculty[];

  /**
   * The events included in this calendar.
   * Many events can be linked to many calendars.
   */
  @ManyToMany(() => Event, (event) => event.calendars)
  @JoinTable()
  events: Event[];
}
