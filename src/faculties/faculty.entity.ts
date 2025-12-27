import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Calendar } from '../calendars/calendar.entity';

@Entity()
export class Faculty {
  /**
   * The unique identifier of the faculty.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The name of the faculty.
   * @example 'Faculty of Engineering'
   */
  @Column()
  name: string;

  /**
   * The acronym of the faculty.
   * @example 'FEUP'
   */
  @Column()
  acronym: string;

  /**
   * Calendars associates with this event.
   * Many calendars can be linked to many faculties.
   */
  @ManyToMany(() => Calendar, (calendar) => calendar.faculties)
  calendars: Calendar[];
}
