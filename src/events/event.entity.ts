import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Calendar } from '../calendars/calendar.entity';

@Entity()
export class Event {
  /**
   * The unique identifier of the event.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The event name.
   * @example 'FEUP Week'
   */
  @Column()
  name: string;

  /**
   * The event description.
   * @example 'FEUP week is a period of interruption of classes and teaching mobility. It includes teaching activities (visits, exhibitions, lectures, ...), as well as the FEUP Project Congress.'
   */
  @Column({ nullable: true })
  description: string;

  /**
   * The start date and time of the event.
   * For single-day events, set this to the event date and leave endDate as null.
   * For period events, set both startDate and endDate.
   * For 'TBD' or 'until' events, this can be null.
   * @example '2025-12-26T09:00:00Z'
   */
  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null;

  /**
   * The end date and time of the event.
   * For period events, set this to the end date.
   * For single-day events, leave this as null.
   * For 'until' events, set this to the deadline and leave startDate as null.
   * @example '2025-12-27T18:00:00Z'
   */
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @ManyToMany(() => Calendar, (calendar) => calendar.events)
  calendars: Calendar[];
}
