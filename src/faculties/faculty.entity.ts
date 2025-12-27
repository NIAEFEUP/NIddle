import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Event } from '../events/event.entity';

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
   * Events associated with this faculty.
   */
  @OneToMany(() => Event, (event) => event.faculty)
  events: Event[];
}
